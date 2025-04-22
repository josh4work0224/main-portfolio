"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import LogoParticles from "./LogoParticles";
import DecryptedText from "./DecryptedText";
import TimeDisplay from "./TimeDisplay";

export default function Hero() {
  const heroRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewportHeight, setViewportHeight] = useState("100vh");

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      setViewportHeight(`${vh}px`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  // 你的名字
  const name = "I'm SHENG CHI";

  return (
    <section
      ref={heroRef}
      style={{ height: `calc(${viewportHeight} * 100)` }}
      className="w-full flex flex-col items-center justify-center relative mx-auto overflow-hidden"
    >
      <div
        className="fixed inset-0 z-10"
        style={{ height: `calc(${viewportHeight} * 100)` }}
      >
        <LogoParticles particleSize={1} particleAmount={5000} />
      </div>
      {/* 使用 DecryptedText 组件显示名字 */}
      <h1 className="font-display leading-none mix-blend-difference">
        <DecryptedText
          text={name}
          speed={50}
          maxIterations={10}
          animateOn="view"
          sequential={true}
          revealDirection="left"
          className="text-6xl font-medium text-white z-20 tracking-tight"
          parentClassName="z-20"
          mixBlendMode="difference"
        />
      </h1>
      <div className="flex flex-row max-w-[40rem] w-full p-8 justify-between fixed bottom-[2rem] gap-2 text-center">
        <h2>UI/UX Designer</h2>
        <h2>Web Designer</h2>
        <h2>Low code Developer</h2>
      </div>
      <div className="flex flex-row w-auto p-2 gap-4 items-center justify-between fixed top-[4rem] lg:left-[2rem] left-[1rem] border border-gray-100/45">
        <div className="flex flex-col">
          <span>Based in Taipei</span>
          <TimeDisplay />
        </div>
        <div className="solid-blink w-2 h-2 bg-lime-300 shadow-[0_0_10px_#adff2f,0_0_20px_#adff2f,0_0_10px_#adff2f]"></div>
      </div>
    </section>
  );
}
