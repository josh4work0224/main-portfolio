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
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // 可調整的動畫參數
  const ANIMATION_PARAMS = {
    STAGGER_SPEED: 0.001,
    CONTENT_DELAY: 300,
    LOGO_DISPLAY_TIME: 800,
    EXIT_DELAY: 50,
  };

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

    // 確保網格大小能夠完全覆蓋
    const gridCols = Math.ceil(width / baseSize) + 1;
    const gridRows = Math.ceil(height / baseSize) + 1;

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
    const totalTiles = gridRows * gridCols;

    for (let i = 0; i < totalTiles; i++) {
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      tiles.push({
        id: i,
        width: `${blockWidth + 0.1}%`,
        height: `${blockHeight + 0.1}%`,
        top: `${row * blockHeight}%`,
        left: `${col * blockWidth}%`,
        display: "none",
        backgroundColor: "#adff2f",
        transform: "translate3d(0, 0, 0)",
      });
    }

    return tiles.sort(() => Math.random() - 0.5);
  };

  // 添加視窗大小變化監聽
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

        // 進場動畫
        await new Promise((resolve) => {
          gsap.to(tiles, {
            display: "block",
            duration: 0,
            stagger: {
              each: ANIMATION_PARAMS.STAGGER_SPEED,
              from: "random",
            },
            onUpdate: () => setMosaicTiles([...tiles]),
            onComplete: resolve,
          });
        });

        // 添加延遲
        await new Promise((resolve) =>
          setTimeout(resolve, ANIMATION_PARAMS.CONTENT_DELAY)
        );

        // 等待新頁面內容加載
        await new Promise((resolve) => {
          setDisplayChildren(children);
          // 給新頁面內容一些時間來初始化
          setTimeout(resolve, 100);
        });

        // 在這裡重置滾動位置，確保在 mosaic 動畫完全進入後
        window.scrollTo(0, 0);

        // Logo 顯示動畫
        if (shouldShowLogo(router.asPath)) {
          setShowLogo(true);
          await new Promise((resolve) =>
            setTimeout(resolve, ANIMATION_PARAMS.LOGO_DISPLAY_TIME)
          );
        }

        // 退場動畫
        setShowLogo(false);

        // 觸發頁面轉場完成事件，讓新頁面初始化 ScrollTrigger
        window.dispatchEvent(new Event("pageTransitionComplete"));

        await new Promise((resolve) => {
          gsap.to(tiles, {
            display: "none",
            duration: 0,
            stagger: {
              each: ANIMATION_PARAMS.STAGGER_SPEED,
              from: "random",
            },
            onUpdate: () => setMosaicTiles([...tiles]),
            onComplete: () => {
              resolve();
            },
          });
        });

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
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
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
              className="absolute"
              style={{
                width: tile.width,
                height: tile.height,
                top: tile.top,
                left: tile.left,
                display: tile.display,
                backgroundColor: tile.backgroundColor,
                transform: tile.transform,
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
