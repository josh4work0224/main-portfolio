"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { createClient } from "contentful";
import Hero from "@/components/HeroParticle";
// import ContentfulSection from "@/components/ContentfulSection";
import FeaturedWorks from "@/components/FeaturedWorks";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";

export default function Home({ works }) {
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
    const handleRouteChangeStart = (url) => {
      console.log("Route change started to:", url);
      // 只有當不是導向首頁時才重置狀態
      if (url !== "/") {
        setIsWorksVisible(false);
      }
    };

    const handleRouteChangeComplete = (url) => {
      console.log("Route change completed to:", url);
      // 如果是導向首頁，手動觸發重新初始化
      if (url === "/") {
        console.log("Navigated to home - reinitializing animations");
        setTimeout(() => {
          setPageKey((prev) => prev + 1);
          initializeScrollTrigger();
          // 觸發自定義事件來重新初始化其他組件
          window.dispatchEvent(new Event("homeNavigationComplete"));
        }, 100);
      }
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
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete
      );
    };
  }, [router]);

  // 首次載入時初始化 ScrollTrigger
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!gsap.plugins.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      // 使用更長的延遲時間確保 DOM 完全渲染
      const timer = setTimeout(() => {
        console.log("Initial load: Setting up ScrollTrigger");
        initializeScrollTrigger();
        // 觸發自定義事件來重新初始化其他組件
        window.dispatchEvent(new Event("homeNavigationComplete"));
      }, 500);

      return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen" key={pageKey}>
      <main className="flex-grow">
        <div
          className={`transition-all duration-300 fixed w-full ${
            isWorksVisible ? "blur-sm" : ""
          }`}
        >
          <Hero />
        </div>
        <section
          ref={worksRef}
          className="lg:px-8 px-4 py-8 relative z-[95] bg-black w-full border-t border-gray-100/45 mt-[100vh]"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Spotlight on</h2>
          <div>
            <FeaturedWorks works={works} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  if (
    !process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ||
    !process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
  ) {
    console.error("Contentful environment variables not set correctly");
    return {
      props: {
        works: [],
      },
    };
  }

  const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  });

  const response = await client.getEntries({
    content_type: "works",
    include: 2,
    "fields.featured": true,
  });

  const works = response.items.map((item) => {
    const fields = { ...item.fields };

    // Break the circular reference for nextProject
    if (fields.nextProject && fields.nextProject.fields) {
      const nextProjectFields = { ...fields.nextProject.fields };
      // Remove the problematic nested reference to avoid circular JSON.
      delete nextProjectFields.nextProject;

      fields.nextProject = {
        ...fields.nextProject,
        fields: nextProjectFields,
      };
    }

    return {
      ...item,
      fields: {
        ...fields,
        slug: item.fields.slug || item.sys.id,
        category: Array.isArray(item.fields.category)
          ? item.fields.category
          : item.fields.category
          ? [item.fields.category]
          : [],
      },
    };
  });

  return {
    props: {
      works,
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
}
