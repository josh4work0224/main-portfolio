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
    const gridRows = 10;
    const gridCols = 20;
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
        gsap.to(tiles, {
          opacity: 1,
          duration: 0.3,
          stagger: {
            each: 0.02,
            from: "start",
            grid: [10, 20],
            axis: "x",
            amount: 0.5,
          },
          ease: "power2.inOut",
          onUpdate: () => {
            setMosaicTiles([...tiles]);
          },
          onComplete: () => {
            if (shouldShowLogo(router.asPath)) {
              setTimeout(() => {
                setShowLogo(true);
              }, 300);
            }

            // 新頁面切換
            setTimeout(() => {
              setDisplayChildren(children);
              window.scrollTo(0, 0);

              // 退場動畫
              setShowLogo(false);
              gsap.to(tiles, {
                opacity: 0,
                duration: 0.3,
                stagger: {
                  each: 0.02,
                  from: "end",
                  grid: [10, 20],
                  axis: "x",
                  amount: 0.5,
                },
                ease: "power2.inOut",
                onUpdate: () => {
                  setMosaicTiles([...tiles]);
                },
                onComplete: () => {
                  // 觸發自定義事件通知轉場完成
                  window.dispatchEvent(new Event("pageTransitionComplete"));
                },
              });
            }, 1000);
          },
        });
      };

      createAndFadeMosaic();
    } else {
      setDisplayChildren(children);
    }
  }, [children, router.asPath]);

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
                className="object-contain filter invert brightness-0 aspect-square lg:w-[20rem] w-[40%]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
