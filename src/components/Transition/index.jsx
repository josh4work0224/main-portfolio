import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { createClient } from "contentful";
import { gsap } from "gsap";

export default function Transition({ children }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [mosaicTiles, setMosaicTiles] = useState([]);
  const [showLogo, setShowLogo] = useState(false);
  const [clientLogo, setClientLogo] = useState(null);
  const router = useRouter();
  const [prevPath, setPrevPath] = useState(router.asPath);

  const fetchWorkData = async (slug) => {
    const client = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
      accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    });

    try {
      const res = await client.getEntries({
        content_type: "works",
        "fields.slug": slug,
        include: 2,
      });

      if (res.items.length > 0 && res.items[0].fields.clientLogo) {
        setClientLogo(res.items[0].fields.clientLogo);
      }
    } catch (error) {
      console.error("Error fetching work data:", error);
    }
  };

  const shouldShowLogo = (path) => {
    return path.startsWith("/works/") && path !== "/works";
  };

  const createMosaicTiles = () => {
    const gridRows = 15;
    const gridCols = 30;
    const blockWidth = 100 / gridCols;
    const blockHeight = 100 / gridRows;

    let tiles = [];

    // 為每一行創建方塊
    for (let row = 0; row < gridRows; row++) {
      // 為每一行創建一個打亂順序的數組
      const colIndexes = Array.from({ length: gridCols }, (_, i) => i);
      shuffleArray(colIndexes);

      // 根據打亂的順序創建方塊
      colIndexes.forEach((col, index) => {
        tiles.push({
          id: row * gridCols + col,
          width: `${blockWidth}%`,
          height: `${blockHeight}%`,
          top: `${row * blockHeight}%`,
          left: `${col * blockWidth}%`,
          opacity: 0,
          row: row,
          col: col,
          shuffleIndex: index,
        });
      });
    }

    return tiles;
  };

  // Fisher-Yates 洗牌算法
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    if (router.asPath !== prevPath) {
      setPrevPath(router.asPath);

      const createAndFadeMosaic = async () => {
        setMosaicTiles([]);
        setShowLogo(false);
        setClientLogo(null);

        const targetPath = router.asPath;
        if (shouldShowLogo(targetPath)) {
          const slug = targetPath.split("/works/")[1];
          await fetchWorkData(slug);
        }

        const tiles = createMosaicTiles();
        setMosaicTiles(tiles);

        // 進場動畫
        await new Promise((resolve) => {
          gsap.to(tiles, {
            opacity: 1,
            duration: 0.2,
            stagger: {
              each: 0.02,
              from: "start",
              grid: [15, 30],
              axis: "x",
              amount: 0.5,
            },
            ease: "none",
            onUpdate: () => {
              setMosaicTiles([...tiles]);
            },
            onComplete: resolve,
          });
        });

        // 添加 0.5 秒延遲
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 等待新頁面內容加載完成
        await new Promise((resolve) => {
          setDisplayChildren(children);

          // 監聽頁面加載完成事件
          const checkPageLoaded = () => {
            const images = document.querySelectorAll("img");
            const allImagesLoaded = Array.from(images).every(
              (img) => img.complete
            );

            if (allImagesLoaded) {
              resolve();
            } else {
              setTimeout(checkPageLoaded, 100);
            }
          };

          checkPageLoaded();
        });

        // Logo 顯示動畫
        if (shouldShowLogo(router.asPath)) {
          setShowLogo(true);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Logo 動畫時間
        }

        // 退場動畫
        window.scrollTo(0, 0);
        setShowLogo(false);

        await new Promise((resolve) => {
          gsap.to(tiles, {
            opacity: 0,
            duration: 0.1,
            stagger: {
              each: 0.02,
              from: "end",
              grid: [15, 30],
              axis: "x",
              amount: 0.5,
            },
            ease: "none",
            onUpdate: () => {
              setMosaicTiles([...tiles]);
            },
            onComplete: () => {
              setTimeout(() => {
                window.dispatchEvent(new Event("pageTransitionComplete"));
                resolve();
              }, 100);
            },
          });
        });
      };

      createAndFadeMosaic();
    } else {
      setDisplayChildren(children);
    }
  }, [children, router.asPath]);

  useEffect(() => {
    if (showLogo && clientLogo) {
      const logo = document.querySelector(".client-logo");
      if (logo) {
        gsap.fromTo(
          logo,
          {
            opacity: 0,
            scale: 0.75,
            transform: "translateY(20px)",
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            transform: "translateY(0)",
          }
        );
      }
    }
  }, [showLogo, clientLogo]);

  return (
    <div className="relative w-full min-h-screen">
      {/* Main Content */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          opacity: 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {displayChildren}
      </div>

      {/* Transition Overlay */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <div className="relative w-full h-full">
          {mosaicTiles.map((tile) => (
            <div
              key={tile.id}
              className="absolute transition-all"
              style={{
                width: tile.width,
                height: tile.height,
                top: tile.top,
                left: tile.left,
                opacity: tile.opacity,
                backgroundColor: "#adff2f",
                boxShadow:
                  tile.opacity > 0
                    ? "0 0 10px #adff2f, 0 0 20px #adff2f"
                    : "none",
              }}
            />
          ))}

          {showLogo && clientLogo && shouldShowLogo(router.asPath) && (
            <div className="absolute w-full h-full flex items-center justify-center">
              <Image
                src={`https:${clientLogo.fields.file.url}`}
                alt={clientLogo.fields.title || "Client Logo"}
                width={400}
                height={400}
                className="client-logo object-contain filter invert brightness-0 aspect-square lg:w-[20rem] w-[40%] opacity-0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
