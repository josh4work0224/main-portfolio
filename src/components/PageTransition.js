import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { gsap } from "gsap";

const MosaicTransition = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const mosaicRef = useRef(null);
  const gridSize = 12;
  const transitioningPathRef = useRef(null);

  const createIrregularMosaicGrid = () => {
    const grid = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const width = gsap.utils.random(5, 15);
      const height = gsap.utils.random(5, 15);
      const left = gsap.utils.random(0, 100 - width);
      const top = gsap.utils.random(0, 100 - height);

      grid.push(
        <div
          key={i}
          className="mosaic-tile absolute bg-lime-300 opacity-0"
          style={{
            width: `${width}%`,
            height: `${height}%`,
            left: `${left}%`,
            top: `${top}%`,
            position: "absolute",
          }}
        />
      );
    }
    return grid;
  };

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      // 安全地檢查 url
      if (url && url !== router.asPath) {
        setIsTransitioning(true);
        transitioningPathRef.current = url;
      }
    };

    const handleRouteChangeComplete = (url) => {
      // 安全地檢查 url
      if (url && transitioningPathRef.current === url) {
        setIsTransitioning(false);
        transitioningPathRef.current = null;
      }
    };

    const handleRouteChangeError = (err, url) => {
      console.error("Route change error:", err);
      // 重置狀態以防止卡住
      setIsTransitioning(false);
      transitioningPathRef.current = null;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  useEffect(() => {
    if (isTransitioning && mosaicRef.current) {
      const tiles = mosaicRef.current.children;

      gsap.to(tiles, {
        opacity: 1,
        duration: 0.8,
        stagger: {
          each: 0.02,
          from: "random",
        },
        onComplete: () => {
          // 安全地推進路由
          if (transitioningPathRef.current) {
            router.push(transitioningPathRef.current).catch((err) => {
              console.error("Navigation error:", err);
              setIsTransitioning(false);
              transitioningPathRef.current = null;
            });
          }
        },
      });
    }
  }, [isTransitioning, router]);

  useEffect(() => {
    if (!isTransitioning && mosaicRef.current) {
      const tiles = mosaicRef.current.children;

      gsap.to(tiles, {
        opacity: 0,
        duration: 0.8,
        stagger: {
          each: 0.02,
          from: "random",
        },
      });
    }
  }, [router.pathname, isTransitioning]);

  return (
    <div className="relative w-full h-full">
      {children}
      <div
        ref={mosaicRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      >
        {createIrregularMosaicGrid()}
      </div>
    </div>
  );
};

export default MosaicTransition;
