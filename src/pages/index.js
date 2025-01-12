"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Hero from "@/components/Hero";
import ContentfulSection from "@/components/ContentfulSection";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";

export default function Home() {
  const [isWorksVisible, setIsWorksVisible] = useState(false);
  const worksRef = useRef(null);
  const triggerRef = useRef(null);
  const router = useRouter();
  const [pageKey, setPageKey] = useState(0);

  // 初始化 ScrollTrigger
  const initializeScrollTrigger = () => {
    console.log("Initializing ScrollTrigger");

    // 清理現有的 ScrollTrigger
    ScrollTrigger.getAll().forEach((t) => t.kill());

    // 創建新的 ScrollTrigger
    if (worksRef.current) {
      triggerRef.current = ScrollTrigger.create({
        trigger: worksRef.current,
        start: "top 90%",
        end: "bottom top",
        onEnter: () => setIsWorksVisible(true),
        onLeave: () => setIsWorksVisible(false),
        onEnterBack: () => setIsWorksVisible(true),
        onLeaveBack: () => setIsWorksVisible(false),
      });
    }

    // 強制刷新 ScrollTrigger
    ScrollTrigger.refresh();
  };

  // 路由變化時的處理
  useEffect(() => {
    const handleRouteChangeStart = () => {
      console.log("Route change started");
      setIsWorksVisible(false); // 重置狀態
      // 不要在這裡清理 ScrollTrigger
    };

    const handleRouteChangeComplete = () => {
      console.log("Route change completed");
      // 移除這裡的立即重置
    };

    const handleTransitionComplete = () => {
      console.log("Transition complete - reinitializing animations");
      setPageKey((prev) => prev + 1);
      setTimeout(() => {
        initializeScrollTrigger();
      }, 100);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      window.removeEventListener("pageTransitionComplete", handleTransitionComplete);
    };
  }, [router]);

  // 首次載入時初始化 ScrollTrigger
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!gsap.plugins.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      console.log("Initial load: Setting up ScrollTrigger");
      initializeScrollTrigger();
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen" key={pageKey}>
      <main className="flex-grow">
        <div
          className={`transition-all duration-300 ${
            isWorksVisible ? "blur-sm" : ""
          }`}
        >
          <Hero />
        </div>
        <section
          ref={worksRef}
          className="lg:px-8 px-4 py-8 relative z-[95] bg-black w-full border-t border-white"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Spotlight on</h2>
          <div>
            <ContentfulSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
