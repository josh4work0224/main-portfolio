import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

const WorkSlider = ({ works }) => {
  // 所有 Hooks 必須在元件頂層
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const timeoutRef = useRef(null);
  const animationRefs = useRef({});

  // 設定常數
  const desktopVisibleItems = 3;
  const mobileVisibleItems = 1;

  // 檢查裝置尺寸 - 設置響應式
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  // 根據螢幕尺寸取得顯示數量
  const visibleItems = useMemo(() => {
    if (isMobile || isTablet) return mobileVisibleItems;
    return desktopVisibleItems;
  }, [isMobile, isTablet]);

  // 檢查是否有作品可顯示 - 確保早期返回不會破壞 Hooks 順序
  const hasWorks = Boolean(works && works.length > 0);

  // 使用 useMemo 計算相關數據
  const sliderData = useMemo(() => {
    if (!hasWorks) {
      return { sliderWorks: [], realItemsCount: 0, beforeClonesCount: 0 };
    }

    // 創建一個包含複製項目的陣列，以實現無限循環
    const beforeClones = [...works.slice(-visibleItems)];
    const afterClones = [...works.slice(0, visibleItems)];
    const sliderWorks = [...beforeClones, ...works, ...afterClones];

    return {
      sliderWorks,
      realItemsCount: works.length,
      beforeClonesCount: beforeClones.length,
    };
  }, [works, visibleItems, hasWorks]);

  // 計算初始索引（應該從真實項目的開始位置開始）
  const initialIndex = useMemo(() => {
    return sliderData.beforeClonesCount || 0;
  }, [sliderData.beforeClonesCount]);

  // 處理滑動位置重置的函數
  const resetPosition = useCallback(() => {
    if (!sliderRef.current || !hasWorks) return;

    const { realItemsCount, beforeClonesCount } = sliderData;

    // 如果滑動到了前面的複製區域
    if (currentIndex < beforeClonesCount) {
      // 無動畫跳轉到對應的真實項目位置
      const newIndex =
        beforeClonesCount + realItemsCount - (beforeClonesCount - currentIndex);

      setTimeout(() => {
        gsap.set(sliderRef.current, {
          xPercent: (-100 * newIndex) / visibleItems,
        });
        setCurrentIndex(newIndex);
        setIsAnimating(false);
      }, 500); // 等待當前動畫完成
    }
    // 如果滑動到了後面的複製區域
    else if (currentIndex >= beforeClonesCount + realItemsCount) {
      // 無動畫跳轉到對應的真實項目位置
      const newIndex =
        beforeClonesCount +
        (currentIndex - (beforeClonesCount + realItemsCount));

      setTimeout(() => {
        gsap.set(sliderRef.current, {
          xPercent: (-100 * newIndex) / visibleItems,
        });
        setCurrentIndex(newIndex);
        setIsAnimating(false);
      }, 500); // 等待當前動畫完成
    } else {
      setIsAnimating(false);
    }
  }, [currentIndex, sliderData, visibleItems, hasWorks]);

  // 處理向前滑動
  const handlePrev = useCallback(() => {
    if (isAnimating || !hasWorks) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isAnimating, hasWorks]);

  // 處理向後滑動
  const handleNext = useCallback(() => {
    if (isAnimating || !hasWorks) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isAnimating, hasWorks]);

  // 設定初始位置
  useEffect(() => {
    if (!sliderRef.current || !hasWorks) return;

    // 初始化位置為第一個真實項目
    setCurrentIndex(initialIndex);

    gsap.set(sliderRef.current, {
      xPercent: (-100 * initialIndex) / visibleItems,
    });
  }, [initialIndex, hasWorks, visibleItems]);

  // 自動輪播
  useEffect(() => {
    if (!hasWorks) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleNext();
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, handleNext, hasWorks]);

  // 滑動動畫和位置重置
  useEffect(() => {
    if (!sliderRef.current || !hasWorks) return;

    // 計算滑動百分比
    const slidePercentage = 100 / visibleItems;

    // 執行滑動動畫
    gsap.to(sliderRef.current, {
      xPercent: -slidePercentage * currentIndex,
      duration: 0.75,
      ease: "power2.inOut",
      onComplete: resetPosition, // 動畫完成後檢查是否需要重置位置
    });
  }, [currentIndex, resetPosition, visibleItems, hasWorks]);

  // 只為焦點項目顯示動畫元素
  useEffect(() => {
    if (!hasWorks || (!isMobile && !isTablet)) return;

    // 先隱藏所有動畫
    Object.values(animationRefs.current).forEach((elements) => {
      if (elements && elements.workAnimate) {
        gsap.set(elements.workAnimate, { scale: 0 });
      }
    });

    // 顯示當前焦點項目的動畫
    const focusedIdx = isMobile || isTablet ? currentIndex : currentIndex + 1;
    const elements = animationRefs.current[focusedIdx];

    if (elements && elements.workAnimate) {
      gsap.to(elements.workAnimate, {
        scale: 1,
        duration: 0.6,
        delay: 0.2,
        ease: "power2.out",
      });
    }
  }, [currentIndex, hasWorks, isMobile, isTablet]);

  // 檢查是否有作品可顯示 - 確保所有 hooks 都已經聲明後才返回
  if (!hasWorks) {
    return <div className="text-center p-8">沒有可顯示的作品</div>;
  }

  // 檢查項目是否為當前焦點
  const isFocused = (idx) => {
    if (isMobile || isTablet) {
      return idx === currentIndex;
    } else {
      return idx === currentIndex + 1;
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex" ref={sliderRef}>
        {sliderData.sliderWorks.map((work, idx) => {
          const focused = isFocused(idx);

          return (
            <div
              key={`${work.sys.id}-${idx}`}
              className={`flex-shrink-0 lg:pr-8 px-4 transition-transform duration-300 ${
                focused ? "z-5" : "opacity-85"
              }`}
              style={{ width: `${100 / visibleItems}%` }}
            >
              <Link
                href={`/works/${work.fields.slug}`}
                scroll={false}
                className="work-item block bg-black border border-white/10"
              >
                <div className="block group rounded-[2px]">
                  <div className="overflow-hidden relative w-full aspect-[2/3] flex flex-col">
                    <div className="w-full h-full ">
                      {work.fields.mainImage?.fields?.file?.url && (
                        <Image
                          src={`https:${work.fields.mainImage.fields.file.url}`}
                          alt={work.fields.name || "Work image"}
                          fill
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        />
                      )}
                      <div
                        className={`absolute w-full h-full p-4 flex flex-col tracking-wide transition-all duration-300
                          ${
                            (isMobile || isTablet) && focused
                              ? "bg-black/[0.75]"
                              : "bg-slate-800/[0.25] hover:bg-black/[0.75]"
                          }`}
                      >
                        <div className="flex flex-row relative w-full justify-between">
                          <h3 className="text-2xl text-white font-medium self-center z-[50]">
                            {work.fields.client}
                          </h3>
                          <h3 className="text-2xl text-white font-medium self-center z-[50]">
                            {new Date(work.fields.publishDate).getFullYear()}
                          </h3>
                        </div>
                        <div className="w-full grow flex flex-cols">
                          <div
                            className={`w-[70%] mx-auto aspect-video relative z-40 overflow-hidden self-center
                              ${
                                isMobile || isTablet
                                  ? "work-animate scale-y-0"
                                  : "scale-y-0 group-hover:scale-100 transition-transform duration-500"
                              }`}
                            ref={(el) => {
                              if (!animationRefs.current[idx]) {
                                animationRefs.current[idx] = {};
                              }
                              animationRefs.current[idx].workAnimate = el;
                            }}
                          >
                            {work.fields.animate?.fields?.file?.url && (
                              <Image
                                src={`https:${work.fields.animate.fields.file.url}`}
                                alt={
                                  work.fields.animate.fields.file.title ||
                                  "Gallery image"
                                }
                                width={1920}
                                height={1080}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row pb-3 pt-1">
                          {Array.isArray(work.fields.type) &&
                            work.fields.type.map((categoryRef) => (
                              <div
                                key={categoryRef.sys.id}
                                className="px-[2px] py-[1px] mr-2 bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px]"
                              >
                                <h4>
                                  {categoryRef.fields?.tagName ||
                                    "Unnamed Category"}
                                </h4>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {works.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 bg-white/40 md:hover:bg-white/80 hover:bg-white/40 md:hover:pl-4 md:hover:pr-8 hover:px-6 text-black px-6 py-2 rounded-full transition-all z-20 mix-blend-difference"
            disabled={isAnimating}
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 bg-white/40 md:hover:bg-white/80 hover:bg-white/40 md:hover:pl-8 md:hover:pr-4 hover:px-6 text-black px-6 py-2 rounded-full transition-all z-20 mix-blend-difference"
            disabled={isAnimating}
          >
            →
          </button>
        </>
      )}
    </div>
  );
};

export default WorkSlider;
