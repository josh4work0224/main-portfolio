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
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

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

  const calculateGridSize = () => {
    const baseSize = 40; // 基礎方塊大小（像素）
    const width = windowSize.width;
    const height = windowSize.height;
    
    const gridCols = Math.floor(width / baseSize);
    const gridRows = Math.floor(height / baseSize);
    
    return {
      rows: Math.max(10, Math.min(gridRows, 20)), // 最小 10 行，最大 20 行
      cols: Math.max(15, Math.min(gridCols, 40)), // 最小 15 列，最大 40 列
    };
  };

  const createMosaicTiles = () => {
    const { rows: gridRows, cols: gridCols } = calculateGridSize();
    const blockWidth = 100 / gridCols;
    const blockHeight = 100 / gridRows;

    let tiles = [];

    for (let row = 0; row < gridRows; row++) {
      const colIndexes = Array.from({ length: gridCols }, (_, i) => i);
      shuffleArray(colIndexes);

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

  // 添加視窗大小變化監聽
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 當視窗大小改變時重新計算馬賽克
  useEffect(() => {
    if (mosaicTiles.length > 0) {
      const newTiles = createMosaicTiles();
      setMosaicTiles(newTiles);
    }
  }, [windowSize]);

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

        const { rows, cols } = calculateGridSize();
        
        // 進場動畫
        await new Promise((resolve) => {
          gsap.to(tiles, {
            opacity: 1,
            duration: 0.2,
            stagger: {
              each: 0.02,
              from: "start",
              grid: [rows, cols],
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
          resolve(); // 移除頁面加載檢查，直接解析 Promise
        });

        // Logo 顯示動畫
        if (shouldShowLogo(router.asPath)) {
          setShowLogo(true);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // 退場動畫
        window.scrollTo(0, 0);
        setShowLogo(false);

        // 確保退場動畫完整執行
        await new Promise((resolve) => {
          const timeline = gsap.timeline({
            onComplete: () => {
              setTimeout(() => {
                window.dispatchEvent(new Event("pageTransitionComplete"));
                resolve();
              }, 100);
            }
          });

          timeline.to(tiles, {
            opacity: 0,
            duration: 0.1,
            stagger: {
              each: 0.02,
              from: "end",
              grid: [rows, cols],
              axis: "x",
              amount: 0.5,
            },
            ease: "none",
            onUpdate: () => {
              setMosaicTiles([...tiles]);
            },
          });
        });

        // 清理馬賽克
        setMosaicTiles([]);
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
