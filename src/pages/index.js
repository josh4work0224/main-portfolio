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

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // 監聽路由變化
      const handleRouteChangeStart = () => {
        if (triggerRef.current) {
          triggerRef.current.kill();
        }
      };

      const handleRouteChangeComplete = () => {
        // 重新初始化 ScrollTrigger
        setTimeout(() => {
          if (worksRef.current) {
            triggerRef.current = ScrollTrigger.create({
              trigger: worksRef.current,
              start: "top 90%",
              end: "bottom top",
              markers: true, // 開發時可以看到觸發點
              onEnter: () => setIsWorksVisible(true),
              onLeave: () => setIsWorksVisible(false),
              onEnterBack: () => setIsWorksVisible(true),
              onLeaveBack: () => setIsWorksVisible(false),
            });
            ScrollTrigger.refresh();
          }
        }, 500);
      };

      router.events.on("routeChangeStart", handleRouteChangeStart);
      router.events.on("routeChangeComplete", handleRouteChangeComplete);

      return () => {
        router.events.off("routeChangeStart", handleRouteChangeStart);
        router.events.off("routeChangeComplete", handleRouteChangeComplete);
        if (triggerRef.current) {
          triggerRef.current.kill();
        }
      };
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen font-['Funnel_Sans']">
      <main className="flex-grow">
        <div
          className={`transition-all duration-300 ${
            isWorksVisible ? "blur-sm" : ""
          }`}
        >
          <Hero />
        </div>
        <section
          className=" lg:px-8 px-4 py-8 relative z-[95] bg-black w-full border-t border-white"
          ref={worksRef}
          data-scroll-section
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
