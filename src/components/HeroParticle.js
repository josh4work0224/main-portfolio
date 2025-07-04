"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";
// import LogoParticles from "./LogoParticles";
import DecryptedText from "./DecryptedText";
import TimeDisplay from "./TimeDisplay";

const LogoParticles = dynamic(() => import("./LogoParticles"), {
  ssr: false,
});

export default function Hero() {
  const heroRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // 你的名字
  const name = "I'm SHENG CHI";

  return (
    <section
      ref={heroRef}
      className="w-full h-[100vh] flex flex-col items-center justify-center relative mx-auto"
    >
      <div className="fixed inset-0 z-10 lg:-translate-y-0 -translate-y-[10vh]">
        <LogoParticles particleSize={1} particleAmount={2500} />
      </div>
      {/* 使用 DecryptedText 组件显示名字 */}
      <h1 className="font-display leading-none mix-blend-difference lg:-translate-y-0 -translate-y-[10vh] text-[10vw]">
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
        <h2>
          <DecryptedText
            text="UI/UX Designer"
            speed={50}
            startEmpty={true}
            delay={600}
            maxIterations={10}
            animateOn="view"
            sequential={true}
            revealDirection="left"
            className="text-6xl font-medium text-white z-20 tracking-tight"
            parentClassName="z-20"
          />
        </h2>
        <h2>
          <DecryptedText
            text="Web Designer"
            speed={20}
            startEmpty={true}
            delay={800}
            maxIterations={10}
            animateOn="view"
            sequential={true}
            revealDirection="left"
            className="text-6xl font-medium text-white z-20 tracking-tight"
            parentClassName="z-20"
          />
        </h2>
        <h2>
          <DecryptedText
            text="Low code Developer"
            speed={20}
            startEmpty={true}
            delay={1000}
            maxIterations={10}
            animateOn="view"
            sequential={true}
            revealDirection="left"
            className="text-6xl font-medium text-white z-20 tracking-tight"
            parentClassName="z-20"
          />
        </h2>
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
