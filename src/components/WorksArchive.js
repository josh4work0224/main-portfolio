import React, { useEffect, useState, useRef } from "react";
import { createClient } from "contentful";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useRouter } from "next/router";
const WorksArchive = ({ initialWorks }) => {
  const [works, setWorks] = useState(initialWorks || []);
  const [sortOrder, setSortOrder] = useState("newest");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const gridRef = useRef(null);
  const [pageKey, setPageKey] = useState(0);
  const router = useRouter();
  const isTransitioning = useRef(false);
  const pendingSortChange = useRef(null);
  const animationRefs = useRef({});
  // 添加一個 ref 來追踪 ScrollTrigger 實例
  const scrollTriggers = useRef([]);
  const shouldPreserveAnimations = useRef(false);
  // 檢查裝置尺寸 - 設置響應式
  useEffect(() => {
    if (typeof window === "undefined") return;
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
  useEffect(() => {
    if (initialWorks?.length > 0) return;
    if (
      !process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ||
      !process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
    ) {
      console.error("環境變數未正確設置");
      return;
    }
    const client = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
      accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    });
    client
      .getEntries({
        content_type: "works",
        include: 2,
      })
      .then((response) => {
        const worksWithSlugs = response.items.map((item) => ({
          ...item,
          fields: {
            ...item.fields,
            slug: item.fields.slug || item.sys.id,
          },
        }));
        setWorks(worksWithSlugs);
      })
      .catch(console.error);
  }, [initialWorks]);
  // 修改動畫初始化邏輯
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    // 根據不同斷點定義列數和偏移量
    const getColumnConfig = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        // lg breakpoint (4 columns)
        return {
          columns: 4,
          offsets: {
            0: { start: 0, end: 0 },
            1: { start: 120, end: -120 },
            2: { start: 40, end: -40 },
            3: { start: 80, end: -80 },
          },
        };
      } else if (width >= 768) {
        // md breakpoint (2 columns)
        return {
          columns: 2,
          offsets: {
            0: { start: 0, end: 0 },
            1: { start: 60, end: -60 },
          },
        };
      } else {
        // mobile (1 column)
        return {
          columns: 1,
          offsets: {
            0: { start: 0, end: 0 },
          },
        };
      }
    };
    const initAnimation = () => {
      console.log("Initializing WorksArchive animations");
      const cards = gridRef.current?.querySelectorAll(".work-card");
      if (!cards?.length) return;
      // 清理之前的動畫
      scrollTriggers.current.forEach((st) => st.kill());
      scrollTriggers.current = [];
      const { columns, offsets } = getColumnConfig();
      cards.forEach((card, index) => {
        const columnIndex = index % columns;
        const { start } = offsets[columnIndex];
        gsap.set(card, { y: start });
      });
      requestAnimationFrame(() => {
        cards.forEach((card, index) => {
          const columnIndex = index % columns;
          const { start, end } = offsets[columnIndex];
          const tl = gsap.fromTo(
            card,
            { y: start },
            {
              y: end,
              duration: 1,
              ease: "none",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 30%",
                end: "center 30%",
                scrub: 1,
                invalidateOnRefresh: true,
                fastScrollEnd: true,
              },
            }
          );
          // 保存 ScrollTrigger 實例以便後續清理
          scrollTriggers.current.push(tl.scrollTrigger);
        });
      });
      // 初始化 hover 動畫元素
      cards.forEach((card, index) => {
        const animateElement = card.querySelector(".work-animate");
        if (animateElement) {
          // 在桌面版設為隱藏(等待hover)，在平板和手機版直接顯示
          if (!isMobile && !isTablet) {
            gsap.set(animateElement, { scale: 0 });
          } else {
            gsap.set(animateElement, { scale: 1 });
          }
        }
      });
    };
    // 添加視窗大小改變的監聽器
    const handleResize = () => {
      initAnimation();
    };
    window.addEventListener("resize", handleResize);
    // 路由變化處理
    const handleRouteChangeStart = () => {
      isTransitioning.current = true;
      // 不要在這裡清理動畫
    };
    const handleRouteChangeComplete = () => {
      isTransitioning.current = false;
      if (pendingSortChange.current !== null) {
        setSortOrder(pendingSortChange.current);
        pendingSortChange.current = null;
      }
    };
    // Transition 完成後的處理
    const handleTransitionComplete = () => {
      console.log("Page transition complete - reinitializing animations");
      setTimeout(() => {
        setPageKey((prev) => prev + 1);
        initAnimation();
      }, 100);
    };
    if (document.readyState === "complete") {
      initAnimation();
    } else {
      window.addEventListener("load", initAnimation);
    }
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete
      );
      window.removeEventListener("load", initAnimation);
      // 只在組件完全卸載時清理
      if (!isTransitioning.current) {
        scrollTriggers.current.forEach((st) => st.kill());
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [works, sortOrder, pageKey, isMobile, isTablet]);
  const handleSortChange = () => {
    if (isTransitioning.current) {
      // 如果正在轉場中，將排序變更儲存起來
      pendingSortChange.current = sortOrder === "newest" ? "oldest" : "newest";
      return;
    }
    // 否則直接更新排序
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };
  const sortedWorks = [...works].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.fields.publishDate) - new Date(a.fields.publishDate);
    } else {
      return new Date(a.fields.publishDate) - new Date(b.fields.publishDate);
    }
  });
  return (
    <section
      className="mt-[8rem] relative z-[95] bg-black w-full"
      key={pageKey}
    >
      <div className="mb-8 flex justify-start">
        <button
          onClick={handleSortChange}
          className="text-white py-2 flex items-center gap-2"
        >
          <span>{sortOrder === "newest" ? "Latest" : "Oldest"}</span>
          <span className="text-sm">↑↓</span>
        </button>
      </div>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {sortedWorks.map((work, idx) => (
          <Link
            href={`/works/${work.fields.slug}`}
            key={work.sys.id}
            className="work-card block group bg-black"
            scroll={false}
          >
            <div className="block group rounded-[2px]">
              <div className="overflow-hidden relative w-full aspect-square flex flex-col">
                <div className="w-full h-full">
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
                        isMobile || isTablet
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
                              ? "scale-100"
                              : "scale-y-0 group-hover:scale-y-100 transition-transform duration-500"
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
        ))}
      </div>
    </section>
  );
};
export default WorksArchive;
