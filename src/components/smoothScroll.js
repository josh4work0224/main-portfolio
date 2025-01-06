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
    destroyLenis();

    // 重置所有滾動相關樣式
    document.body.style.height = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.height = "";

    // 使用 setTimeout 確保 DOM 已完全更新
    setTimeout(() => {
      // 初始化 Lenis
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

      ScrollTrigger.refresh(true);
    }, 100);
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
      // 首次加載等待 DOM 完全準備好
      if (document.readyState === "complete") {
        initLenis();
      } else {
        window.addEventListener("load", initLenis);
      }
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
