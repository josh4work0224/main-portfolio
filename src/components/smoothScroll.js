import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useRouter } from "next/router";

gsap.registerPlugin(ScrollTrigger);

// 創建一個自定義事件來協調轉場和滾動初始化
const TRANSITION_COMPLETE_EVENT = "pageTransitionComplete";

export function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const router = useRouter();
  const isInitialMount = useRef(true);

  const destroyLenis = () => {
    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current = null;
    }
    ScrollTrigger.getAll().forEach((st) => st.kill());
    ScrollTrigger.clearMatchMedia();
  };

  const initLenis = () => {
    // 確保先清理現有實例
    destroyLenis();

    // 移除這些樣式重置，讓頁面自然展開
    // document.body.style.height = "";
    // document.body.style.overflow = "";
    // document.documentElement.style.overflow = "";
    // document.documentElement.style.height = "";

    // 增加延遲時間，確保 DOM 完全準備好
    setTimeout(() => {
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      lenisRef.current.on("scroll", () => {
        ScrollTrigger.update();
      });

      function raf(time) {
        if (lenisRef.current) {
          lenisRef.current.raf(time);
          requestAnimationFrame(raf);
        }
      }
      requestAnimationFrame(raf);

      // 強制更新 ScrollTrigger
      ScrollTrigger.refresh(true);
    }, 500); // 增加延遲時間到 500ms
  };

  useEffect(() => {
    const handleRouteChangeStart = () => {
      destroyLenis();
    };

    // 監聽自定義轉場完成事件
    const handleTransitionComplete = () => {
      initLenis();
      setTimeout(() => {
        ScrollTrigger.refresh(true);
      }, 100);
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;

      // 修改首次載入的初始化邏輯
      const initialLoad = () => {
        // 確保 DOM 完全載入後再初始化
        if (document.readyState === "complete") {
          setTimeout(initLenis, 100);
        } else {
          window.addEventListener("load", () => setTimeout(initLenis, 100), {
            once: true,
          });
        }
      };

      initialLoad();
    }

    router.events.on("routeChangeStart", handleRouteChangeStart);
    window.addEventListener(
      TRANSITION_COMPLETE_EVENT,
      handleTransitionComplete
    );

    const handleResize = () => {
      if (lenisRef.current) {
        lenisRef.current.resize();
        ScrollTrigger.refresh(true);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        TRANSITION_COMPLETE_EVENT,
        handleTransitionComplete
      );
      window.removeEventListener("load", initLenis);
      router.events.off("routeChangeStart", handleRouteChangeStart);
      destroyLenis();
    };
  }, [router.asPath]);

  return children;
}
