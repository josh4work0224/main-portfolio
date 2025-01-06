import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Hero from "@/components/Hero";
import ContentfulSection from "@/components/ContentfulSection";
import Footer from "@/components/Footer";

export default function Home() {
  const [isWorksVisible, setIsWorksVisible] = useState(false);
  const worksRef = useRef(null);

  useEffect(() => {
    // 確保 ScrollTrigger 已經被註冊
    if (!ScrollTrigger.getAll().length) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const trigger = ScrollTrigger.create({
      trigger: worksRef.current,
      start: "top 90%",
      end: "bottom top",
      onEnter: () => setIsWorksVisible(true),
      onLeave: () => setIsWorksVisible(false),
      onEnterBack: () => setIsWorksVisible(true),
      onLeaveBack: () => setIsWorksVisible(false),
    });

    return () => {
      trigger.kill();
    };
  }, []);

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
