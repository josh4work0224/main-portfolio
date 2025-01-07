"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SplitType from "split-type";
import RiveComp from "./RiveComp";

export default function Hero() {
  const heroRef = useRef(null);
  const ghostRef = useRef(null);
  const splitTextRef = useRef(null);
  const scrollTriggersRef = useRef([]);
  const [hoveredKeyword, setHoveredKeyword] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [mosaicTiles, setMosaicTiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBackground, setShowBackground] = useState(false);
  const [loadingMosaicTiles, setLoadingMosaicTiles] = useState([]);

  const keywords = {
    WEBSITES: "/assets/home-website.webp",
    "UI/UX": "/assets/home-ui-ux.webp",
    "LOW/NO CODE SOLUTIONS": "/assets/home-develope.webp",
  };

  // 移動鼠標事件處理到一個獨立的useEffect中
  useEffect(() => {
    const handleKeywordHover = (keyword, isEntering) => {
      if (window.innerWidth < 1024) return;

      if (isEntering) {
        handleMouseEnter(keyword);
      } else {
        handleMouseLeave();
      }
    };

    // 為每個關鍵詞添加事件監聽器
    const keywordElements = document.querySelectorAll(".keyword-highlight");
    keywordElements.forEach((element) => {
      const keyword = element.textContent.trim();
      element.addEventListener("mouseenter", () =>
        handleKeywordHover(keyword, true)
      );
      element.addEventListener("mouseleave", () =>
        handleKeywordHover(keyword, false)
      );
    });

    // 清理函數
    return () => {
      keywordElements.forEach((element) => {
        const keyword = element.textContent.trim();
        element.removeEventListener("mouseenter", () =>
          handleKeywordHover(keyword, true)
        );
        element.removeEventListener("mouseleave", () =>
          handleKeywordHover(keyword, false)
        );
      });
    };
  }, []); // 空依賴數組，只在組件掛載時運行

  const handleMouseEnter = (keyword) => {
    if (!heroRef.current) return;

    setHoveredKeyword(keyword);
    setShowImage(false);

    // Ghost text 更新
    if (ghostRef.current) {
      const ghostHighlights =
        ghostRef.current.querySelectorAll(".ghost-highlight");
      ghostHighlights.forEach((highlight) => {
        const isActive = highlight.dataset.keyword === keyword;
        highlight.style.opacity = isActive ? "1" : "0";
        highlight.style.textShadow = isActive
          ? "0 0 10px #adff2f, 0 0 20px #adff2f, 0 0 30px #adff2f "
          : "none";
      });
    }

    // Pixelate 動畫生成，加入隨機排序邏輯
    const gridCols = 10;
    const gridRows = 10;
    const blockWidth = 100 / gridCols;
    const blockHeight = 100 / gridRows;

    let newTiles = Array.from({ length: gridCols * gridRows }).map(
      (_, index) => {
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);

        return {
          id: index,
          width: `${blockWidth}%`,
          height: `${blockHeight}%`,
          top: `${row * blockHeight}%`,
          left: `${col * blockWidth}%`,
          opacity: 0,
        };
      }
    );

    // 打亂順序（Fisher-Yates 洗牌算法）
    newTiles = newTiles.sort(() => Math.random() - 0.5);

    setMosaicTiles(newTiles);

    // 用 GSAP 控制動畫
    gsap.to(newTiles, {
      opacity: 1,
      stagger: (i) => 0.02 * i, // 根據隨機化的順序設置延遲
      duration: 0.4,
      ease: "power2.inOut",
      onUpdate: () => {
        setMosaicTiles([...newTiles]);
      },
      onComplete: () => {
        // 確保馬賽克完全顯示後，再設置圖片可見
        setShowImage(true);
        gsap.to(newTiles, {
          opacity: 0,
          stagger: (i) => 0.02 * i,
          duration: 0.4,
          ease: "power2.inOut",
          onUpdate: () => {
            setMosaicTiles([...newTiles]);
          },
        });
      },
    });
  };

  const handleMouseLeave = () => {
    if (!heroRef.current) return;

    setHoveredKeyword(null);
    setShowImage(false);

    // Ghost text 更新
    if (ghostRef.current) {
      const ghostHighlights =
        ghostRef.current.querySelectorAll(".ghost-highlight");
      ghostHighlights.forEach((highlight) => {
        highlight.style.opacity = "0";
        highlight.style.textShadow = "none";
      });
    }

    // 淡出動畫
    const newTiles = mosaicTiles.map((tile) => ({
      ...tile,
      opacity: 1,
    }));

    gsap.to(newTiles, {
      opacity: 0,
      stagger: (i) => 0.02 * i,
      duration: 0.4,
      ease: "power2.inOut",
      onUpdate: () => {
        setMosaicTiles([...newTiles]);
      },
    });
  };

  const handleKeywordClick = (keyword) => {
    if (hoveredKeyword === keyword) {
      handleMouseLeave(); // 如果已经选中，取消选中
    } else {
      handleMouseEnter(keyword); // 否则，选中该关键词
    }
  };

  // 修改初始化 ScrollTrigger 和 SplitText 的 useEffect
  useEffect(() => {
    // 確保在客戶端環境中
    if (typeof window !== "undefined") {
      // 在這裡註冊 ScrollTrigger
      gsap.registerPlugin(ScrollTrigger);

      // 等待一下確保 DOM 完全載入
      const timer = setTimeout(() => {
        if (!heroRef.current) return;

        const textElement = heroRef.current.querySelector(".split-text");
        if (!textElement) return;

        // 將 ghostContainer 的創建移到 setTimeout 外部
        const ghostContainer = document.createElement("div");
        ghostContainer.className = "ghost-container";
        ghostContainer.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: auto;
          pointer-events: none;
          z-index: 50;
        `;

        // 添加 ghost container 到 DOM
        heroRef.current.appendChild(ghostContainer);
        ghostRef.current = ghostContainer;

        // 確保在組件掛載後等待一小段時間再初始化
        const initTimer = setTimeout(() => {
          const splitText = new SplitType(textElement, {
            types: "lines,words",
            tagName: "span",
          });

          splitTextRef.current = splitText;

          const ghostH1 = textElement.cloneNode(true);
          ghostH1.classList.remove("split-text");
          ghostH1.classList.add("ghost-text");

          // 處理 ghost text
          const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const span = document.createElement("span");
              span.textContent = node.textContent;
              span.style.opacity = "0";
              return span;
            }

            if (
              node.classList &&
              node.classList.contains("keyword-highlight")
            ) {
              const clone = node.cloneNode(true);
              clone.classList.remove("cursor-pointer");
              clone.classList.add("ghost-highlight");
              clone.style.opacity = "0";
              clone.dataset.keyword = node.textContent.trim();
              return clone;
            }

            const clone = node.cloneNode(false);
            clone.style.opacity = "1";
            Array.from(node.childNodes).forEach((child) => {
              clone.appendChild(processNode(child));
            });
            return clone;
          };

          const processedH1 = processNode(ghostH1);
          ghostContainer.appendChild(processedH1);

          // 修改滾動動畫的初始化
          splitText.words.forEach((word) => {
            word.style.opacity = 0.1;
          });

          const totalLines = splitText.lines.length;
          const scrollPerLine = 1 / totalLines;

          splitText.lines.forEach((line, index) => {
            const words = line.querySelectorAll(".word");
            const ghostWords = processedH1.querySelectorAll(".word");

            const trigger = ScrollTrigger.create({
              trigger: heroRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              immediateRender: false,
              onUpdate: (self) => {
                const progress = self.progress;
                const lineStart = scrollPerLine * index;
                const lineEnd = scrollPerLine * (index + 1);
                const lineProgress = gsap.utils.clamp(
                  0,
                  1,
                  (progress - lineStart) / (lineEnd - lineStart)
                );

                const wordsToShow = Math.floor(words.length * lineProgress);

                words.forEach((word, wordIndex) => {
                  if (word) {
                    if (index === 0) {
                      const firstLineProgress = gsap.utils.clamp(
                        0,
                        1,
                        self.progress * 3
                      );
                      word.style.opacity =
                        wordIndex < words.length * firstLineProgress ? 1 : 0.1;
                    } else {
                      word.style.opacity = wordIndex < wordsToShow ? 1 : 0.1;
                    }
                  }
                  if (ghostWords[wordIndex]) {
                    ghostWords[wordIndex].style.opacity =
                      wordIndex < wordsToShow ? 1 : 0;
                  }
                });
              },
              onRefreshInit: () => {
                updateGhostPosition();
              },
            });

            scrollTriggersRef.current.push(trigger);
          });

          // 強制刷新
          ScrollTrigger.refresh();

          // 添加這個來確保初始狀態正確
          ScrollTrigger.addEventListener("refresh", () => {
            const progress = ScrollTrigger.getAll()[0]?.progress ?? 0;
            if (
              progress === 0 &&
              splitTextRef.current &&
              splitTextRef.current.lines
            ) {
              const firstLine = splitTextRef.current.lines[0];
              if (firstLine) {
                splitTextRef.current.words.forEach((word) => {
                  if (firstLine.contains(word)) {
                    word.style.opacity = 0.1;
                  }
                });
              }
            }
          });
        }, 1000); // 增加延遲時間

        // 修改位置同步邏輯
        const updateGhostPosition = () => {
          if (!textElement || !ghostContainer || !heroRef.current) return;

          const rect = textElement.getBoundingClientRect();
          const heroRect = heroRef.current.getBoundingClientRect();

          // 添加響應式判斷
          const isDesktop = window.innerWidth >= 991;

          // 如果是手機版，調整定位策略
          if (!isDesktop) {
            ghostContainer.style.position = "absolute";
            ghostContainer.style.left = "0";
            ghostContainer.style.maxWidth = "calc(100% - 32px)";
            ghostContainer.style.transform = `translateY(${
              rect.top - heroRect.top
            }px) translateX(${rect.left - heroRect.left}px)`;
          } else {
            // 桌面版原有邏輯
            ghostContainer.style.transform = `translateY(${
              rect.top - heroRect.top
            }px) translateX(${rect.left - heroRect.left}px)`;
          }

          // 只在 hero section 可見時更新位置
          if (heroRect.top <= 0 && heroRect.bottom >= 0) {
            ghostContainer.style.transform = `translateY(${
              rect.top - heroRect.top
            }px) translateX(${rect.left - heroRect.left}px)`;
            ghostContainer.style.opacity = "1";
          } else {
            ghostContainer.style.opacity = "0";
          }
        };

        // 修改 ScrollTrigger 設置
        const positionTrigger = ScrollTrigger.create({
          trigger: heroRef.current, // 改為使用 hero section 作為觸發器
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: updateGhostPosition,
          // 添加 pin 功能，讓 ghost text 在離開 hero section 時停止
          pin: false,
          pinSpacing: false,
        });

        // 初始位置更新
        updateGhostPosition();

        // 添加 scroll 事件監聽，確保平滑更新
        window.addEventListener("scroll", () => {
          requestAnimationFrame(updateGhostPosition);
        });

        // 清理函數
        return () => {
          clearTimeout(initTimer);
          if (splitTextRef.current) {
            splitTextRef.current.revert();
          }
          scrollTriggersRef.current.forEach((trigger) => trigger.kill());
          if (ghostRef.current) {
            ghostRef.current.remove();
          }
        };
      }, 1000);

      return () => {
        clearTimeout(timer);
        // 清理所有 ScrollTrigger 實例
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        ScrollTrigger.clearMatchMedia();
      };
    }
  }, []);

  useEffect(() => {
    if (showImage) {
      // 在圖片顯示後0.2秒，開始逐漸消失馬賽克
      setTimeout(() => {
        setMosaicTiles((prevTiles) =>
          prevTiles.map((tile) => ({
            ...tile,
            opacity: 0, // 隱藏馬賽克
          }))
        );
      }, 200); // 等待圖片顯示後0.5秒再開始動畫
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const initializeMosaicTiles = () => {
        const gridCols = 10; // 定義列數
        const gridRows = 10; // 定義行數
        const blockWidth = 100 / gridCols;
        const blockHeight = 100 / gridRows;

        // 生成基本結構
        let tiles = Array.from({ length: gridCols * gridRows }).map(
          (_, index) => {
            const col = index % gridCols;
            const row = Math.floor(index / gridCols);

            return {
              id: index,
              width: `${blockWidth}%`,
              height: `${blockHeight}%`,
              top: `${row * blockHeight}%`,
              left: `${col * blockWidth}%`,
              opacity: 0,
              backgroundColor: "#adff2f",
            };
          }
        );

        // 隨機打亂順序
        tiles = tiles.sort(() => Math.random() - 0.5);

        return tiles;
      };

      const startLoadingAnimation = (tiles) => {
        // 開始顯示動畫
        gsap.to(tiles, {
          opacity: 1,
          stagger: 0.02,
          duration: 0.4,
          ease: "power2.inOut",
          onUpdate: () => {
            setLoadingMosaicTiles([...tiles]);
          },
          onComplete: () => {
            // 延遲背景出現和 tiles 淡出動畫
            setTimeout(() => {
              setShowBackground(true); // 背景顯示

              // 淡出動畫
              gsap.to(tiles, {
                opacity: 0,
                stagger: 0.02,
                duration: 0.4,
                ease: "power2.inOut",
                onUpdate: () => {
                  setLoadingMosaicTiles([...tiles]);
                },
                onComplete: () => {
                  setIsLoading(false); // 完成後設置 loading 狀態為 false
                },
              });
            }, 1000); // 背景出現的延遲
          },
        });
      };

      // 初始化 tiles 並啟動動畫
      const tiles = initializeMosaicTiles();
      setLoadingMosaicTiles(tiles);
      startLoadingAnimation(tiles);
    }, 2000);
  }, []);

  return (
    <section
      ref={heroRef}
      className="w-full h-[300vh] flex flex-col items-center max-w-[100rem] pt-[50vh] relative mx-auto p-8 pb-20"
    >
      <div className="fixed inset-0 z-10">
        <RiveComp />
      </div>
      {/* Background image */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[11] pointer-events-none ${
          showBackground ? "opacity-100 " : "opacity-0"
        }`}
      >
        <Image
          src="/assets/hero-bg.jpg"
          alt="background"
          width={1920}
          height={1080}
          className="object-cover lg:w-[25vw] h-[60vh] w-[70vw]"
        />
      </div>

      {/* Loading mosaic overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="relative lg:w-[25vw] h-[60vh] w-[70vw] overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
              {loadingMosaicTiles.map((tile) => (
                <div
                  key={tile.id}
                  className="bg-[#adff2f] absolute"
                  style={{
                    width: tile.width,
                    height: tile.height,
                    top: tile.top,
                    left: tile.left,
                    opacity: tile.opacity,
                    backgroundColor: tile.backgroundColor,
                    boxShadow:
                      tile.opacity > 0
                        ? `0 0 10px ${tile.backgroundColor}, 0 0 20px ${tile.backgroundColor}`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyword images */}
      {Object.entries(keywords).map(([keyword, imgSrc]) => (
        <div
          key={keyword}
          className={`fixed inset-0 flex items-center justify-center transition-opacity duration-1000 pointer-events-none ${
            isLoading
              ? "opacity-0"
              : hoveredKeyword === keyword
              ? "z-40 opacity-100"
              : "z-[-1] opacity-0"
          }`}
        >
          <div className="relative lg:w-[25vw] h-[60vh] w-[70vw] overflow-hidden">
            {/* Mosaic overlay */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none z-40">
              {mosaicTiles.map((tile) => (
                <div
                  key={tile.id}
                  className="bg-[#adff2f] absolute"
                  style={{
                    width: tile.width,
                    height: tile.height,
                    top: tile.top,
                    left: tile.left,
                    opacity: tile.opacity,
                    backgroundColor: tile.backgroundColor,
                    boxShadow:
                      tile.opacity > 0
                        ? `0 0 10px ${tile.backgroundColor}, 0 0 20px ${tile.backgroundColor}`
                        : "none",
                  }}
                />
              ))}
            </div>
            {/* Keyword image */}
            <Image
              src={imgSrc}
              alt={keyword}
              width={1920}
              height={1080}
              className={`relative z-10 object-cover w-full h-full transition-opacity duration-700 ${
                showImage && hoveredKeyword === keyword
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              style={{
                zIndex: hoveredKeyword === keyword && showImage ? 10 : -1,
              }}
            />
          </div>
        </div>
      ))}

      {/* Main text content */}
      <div
        className={`w-full flex flex-col items-center gap-2 sticky top-[20%] z-30 transition-opacity duration-1000 ${
          isLoading
            ? "opacity-0"
            : hoveredKeyword
            ? "opacity-50"
            : "opacity-100"
        }`}
      >
        <div className="line relative w-full">
          <h1 className="split-text font-display text-wrap whitespace-normal overflow-wrap break-word">
            Hello,
            <br />
            I&apos;m SHENG CHI (AKA Josh)
            <br />I create engaging{" "}
            <span
              className={`keyword-highlight cursor-pointer text-[#adff2f] transition-opacity duration-300 ease-out ${
                hoveredKeyword === "WEBSITES"
                  ? "text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]"
                  : ""
              } lg:hover:text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]`}
              onClick={() => handleKeywordClick("WEBSITES")}
              onMouseEnter={() =>
                window.innerWidth >= 1024 && handleMouseEnter("WEBSITES")
              }
              onMouseLeave={() =>
                window.innerWidth >= 1024 && handleMouseLeave()
              }
            >
              WEBSITES
            </span>
            ,
            <br />
            build thoughtful{" "}
            <span
              className={`keyword-highlight cursor-pointer text-[#adff2f] transition-opacity duration-300 ease-out ${
                hoveredKeyword === "UI/UX"
                  ? "text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]"
                  : ""
              } lg:hover:text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]`}
              onClick={() => handleKeywordClick("UI/UX")}
              onMouseEnter={() =>
                window.innerWidth >= 1024 && handleMouseEnter("UI/UX")
              }
              onMouseLeave={() =>
                window.innerWidth >= 1024 && handleMouseLeave()
              }
            >
              UI/UX
            </span>
            ,
            <br />
            and bring ideas to life through
            <br />
            <span
              className={`keyword-highlight cursor-pointer text-[#adff2f] transition-opacity duration-300 ease-out ${
                hoveredKeyword === "LOW/NO CODE SOLUTIONS"
                  ? "text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]"
                  : ""
              } lg:hover:text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]`}
              onClick={() => handleKeywordClick("LOW/NO CODE SOLUTIONS")}
              onMouseEnter={() =>
                window.innerWidth >= 1024 &&
                handleMouseEnter("LOW/NO CODE SOLUTIONS")
              }
              onMouseLeave={() =>
                window.innerWidth >= 1024 && handleMouseLeave()
              }
            >
              LOW/NO CODE SOLUTIONS
            </span>
            .
          </h1>
          <div className="flex flex-row gap-4 items-center">
            <div className="solid-blink w-4 h-4 bg-lime-300 shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_10px_#adff2f]"></div>
            <p className="text-lg">Based in Taipei</p>
          </div>
        </div>
      </div>
    </section>
  );
}
