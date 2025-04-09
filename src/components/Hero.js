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
    "LOW CODE SOLUTIONS": "/assets/home-develope.webp",
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

  const initializeMosaicTiles = (gridSize = 10) => {
    const totalPixels = gridSize * gridSize;
    let tiles = Array.from({ length: totalPixels }).map((_, index) => {
      const col = index % gridSize;
      const row = Math.floor(index / gridSize);
      const size = 100 / gridSize;

      return {
        id: index,
        width: `${size}%`,
        height: `${size}%`,
        top: `${row * size}%`,
        left: `${col * size}%`,
        display: "none", // Changed from opacity
        backgroundColor: "#adff2f",
      };
    });

    return tiles.sort(() => Math.random() - 0.5);
  };

  const animatePixels = (tiles, onComplete) => {
    const timeline = gsap.timeline();

    timeline
      .to(tiles, {
        display: "block",
        duration: 0,
        stagger: {
          each: 0.02,
          from: "random",
        },
        onUpdate: () => setMosaicTiles([...tiles]),
      })
      .add(() => {
        if (onComplete) onComplete();
      })
      .to(tiles, {
        display: "none",
        duration: 0,
        delay: 0.4,
        stagger: {
          each: 0.02,
          from: "random",
        },
        onUpdate: () => setMosaicTiles([...tiles]),
      });

    return timeline;
  };

  const handleMouseEnter = (keyword) => {
    if (!heroRef.current) return;

    // 清除任何現有的離開定時器
    clearTimeout(window.leaveTimer);

    // 如果已經有關鍵字被選中，直接開始新的動畫
    if (hoveredKeyword && hoveredKeyword !== keyword) {
      // 如果有正在進行的動畫，立即完成它
      if (window.currentAnimation) {
        window.currentAnimation.progress(1);
        window.currentAnimation.kill();
      }
      // 保持圖片可見，不重置透明度動畫
      setShowImage(true);
    } else if (!hoveredKeyword) {
      // 只有在之前沒有選中關鍵字時才設置 showImage 為 false
      setShowImage(false);
    }

    setHoveredKeyword(keyword);

    // Update ghost text
    if (ghostRef.current) {
      const ghostHighlights =
        ghostRef.current.querySelectorAll(".ghost-highlight");
      ghostHighlights.forEach((highlight) => {
        const isActive = highlight.dataset.keyword === keyword;
        highlight.style.opacity = isActive ? "1" : "0";
        highlight.style.textShadow = isActive
          ? "0 0 10px #adff2f, 0 0 20px #adff2f, 0 0 30px #adff2f"
          : "none";
      });
    }

    const tiles = initializeMosaicTiles();
    setMosaicTiles(tiles);

    // 創建一個新的動畫時間軸
    const timeline = gsap.timeline();
    window.currentAnimation = timeline;

    timeline
      .to(tiles, {
        display: "block",
        duration: 0,
        stagger: {
          each: 0.02,
          from: "random",
        },
        onUpdate: () => setMosaicTiles([...tiles]),
      })
      .add(() => {
        setShowImage(true);
      })
      .to(tiles, {
        display: "none",
        duration: 0,
        delay: 0.4,
        stagger: {
          each: 0.02,
          from: "random",
        },
        onUpdate: () => setMosaicTiles([...tiles]),
      });
  };

  const handleMouseLeave = () => {
    if (!heroRef.current) return;

    // 清除任何現有的定時器
    clearTimeout(window.leaveTimer);

    // 設置一個較短的延遲，讓新的hover有機會取消這個動作
    window.leaveTimer = setTimeout(() => {
      // 如果在這個延遲期間沒有新的hover事件，則執行離開動畫
      if (window.currentAnimation) {
        window.currentAnimation.progress(1);
        window.currentAnimation.kill();
        window.currentAnimation = null;
      }

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

      // 確保馬賽克完全消失
      const exitTiles = [...mosaicTiles];
      gsap.to(exitTiles, {
        display: "none",
        stagger: {
          each: 0.02,
          from: "random",
        },
        duration: 0,
        onUpdate: () => setMosaicTiles([...exitTiles]),
        onComplete: () => setMosaicTiles([]),
      });
    }, 50); // 使用更短的延遲時間
  };

  const handleGlobalClick = (e) => {
    // 只在手機版處理
    if (window.innerWidth >= 1024) return;

    // 檢查點擊是否在關鍵字上
    const isKeywordClick = e.target.classList.contains("keyword-highlight");

    // 如果不是點擊關鍵字，且當前有高亮的關鍵字，則關閉高亮
    if (!isKeywordClick && hoveredKeyword) {
      handleMouseLeave();
    }
  };

  const handleKeywordClick = (keyword) => {
    // 阻止事件冒泡，避免觸發全局點擊事件
    event.stopPropagation();

    if (hoveredKeyword === keyword) {
      handleMouseLeave();
    } else {
      handleMouseEnter(keyword);
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
              end: "90% bottom",
              scrub: true,
              immediateRender: false,
              onUpdate: (self) => {
                const progress = self.progress * 1.25;
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
                        self.progress * 4
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
      const tiles = initializeMosaicTiles();
      setLoadingMosaicTiles(tiles);

      // 只執行一次完整的進場動畫
      gsap.to(tiles, {
        display: "block",
        duration: 0,
        stagger: {
          each: 0.02,
          from: "random",
        },
        onUpdate: () => setLoadingMosaicTiles([...tiles]),
        onComplete: () => {
          setShowBackground(true);
          // 延遲後執行退場動畫
          setTimeout(() => {
            gsap.to(tiles, {
              display: "none",
              duration: 0,
              stagger: {
                each: 0.02,
                from: "random",
              },
              onUpdate: () => setLoadingMosaicTiles([...tiles]),
              onComplete: () => {
                setIsLoading(false);
              },
            });
          }, 800); // 調整這個時間以控制背景顯示的持續時間
        },
      });
    }, 1000); // 減少初始延遲時間
  }, []);

  // 修改初始化動畫的 useEffect
  useEffect(() => {
    const handleTransitionComplete = () => {
      // 重新初始化動畫
      setTimeout(() => {
        if (typeof window !== "undefined") {
          gsap.registerPlugin(ScrollTrigger);
          // 重新初始化您的動畫邏輯
          // ...
        }
      }, 100);
    };

    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    return () => {
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete
      );
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const handleHomeNavigation = () => {
      console.log("Home navigation detected - reinitializing Hero animations");
      // 重新初始化 Hero 組件的動畫
      if (typeof window !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        // 重新初始化您的動畫邏輯
        // ...
      }
    };

    window.addEventListener("homeNavigationComplete", handleHomeNavigation);

    return () => {
      window.removeEventListener(
        "homeNavigationComplete",
        handleHomeNavigation
      );
    };
  }, []);

  useEffect(() => {
    // 添加全局點擊監聽
    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [hoveredKeyword]); // 依賴於 hoveredKeyword 狀態

  // 在組件卸載時清理
  useEffect(() => {
    return () => {
      if (window.currentAnimation) {
        window.currentAnimation.kill();
      }
      clearTimeout(window.leaveTimer);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="w-full h-[300vh] flex flex-col items-center max-w-[100rem] pt-[50vh] relative mx-auto md:px-8 p-4 pb-20"
    >
      <div className="fixed inset-0 z-10 h-[100vh]">
        <RiveComp />
      </div>
      {/* Background image */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[11] pointer-events-none ${
          showBackground ? "opacity-100 " : "opacity-0"
        }`}
      >
        <div className="relative md:h-[60vh] md:w-auto h-auto w-[70vw] aspect-[3/4] overflow-hidden">
          <Image
            src="/assets/hero-bg.webp"
            alt="background"
            width={1920}
            height={1080}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

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
          <div className="relative md:h-[60vh] md:w-auto h-auto w-[70vw] aspect-[3/4] overflow-hidden">
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
                    display: tile.display,
                    backgroundColor: tile.backgroundColor,
                    boxShadow:
                      tile.display === "block"
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

      {/* Loading mosaic overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="relative md:h-[60vh] md:w-auto h-auto w-[70vw] aspect-[3/4] overflow-hidden">
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
                    display: tile.display,
                    backgroundColor: tile.backgroundColor,
                    boxShadow:
                      tile.display === "block"
                        ? `0 0 10px ${tile.backgroundColor}, 0 0 20px ${tile.backgroundColor}`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main text content */}
      <div
        className={`w-full flex flex-col pb-24 items-center gap-2 sticky top-[20%] z-30 transition-opacity duration-1000 ${
          isLoading
            ? "opacity-0"
            : hoveredKeyword
            ? "opacity-50"
            : "opacity-100"
        }`}
      >
        <div className="line relative w-full">
          <h1 className="split-text font-display text-wrap whitespace-normal overflow-wrap break-word leading-tight">
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
                hoveredKeyword === "LOW CODE SOLUTIONS"
                  ? "text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]"
                  : ""
              } lg:hover:text-shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_30px_#adff2f]`}
              onClick={() => handleKeywordClick("LOW CODE SOLUTIONS")}
              onMouseEnter={() =>
                window.innerWidth >= 1024 &&
                handleMouseEnter("LOW CODE SOLUTIONS")
              }
              onMouseLeave={() =>
                window.innerWidth >= 1024 && handleMouseLeave()
              }
            >
              LOW CODE SOLUTIONS
            </span>
            .
          </h1>
          <div className="flex flex-row gap-4 items-center mt-8">
            <div className="solid-blink w-4 h-4 bg-lime-300 shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_10px_#adff2f]"></div>
            <p className="text-lg">Based in Taipei</p>
          </div>
        </div>
      </div>
    </section>
  );
}
