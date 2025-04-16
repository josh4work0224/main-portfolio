"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import LogoParticles from "./LogoParticles";
import DecryptedText from "./DecryptedText";

export default function Hero() {
  const heroRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // 你的名字
  const name = "SHENGCHI HUANG";

  return (
    <section
      ref={heroRef}
      className="w-full h-[100vh] flex flex-col items-center justify-center relative mx-auto"
    >
      <div className="fixed inset-0 z-10">
        <LogoParticles particleSize={1.5} particleAmount={5000} />
      </div>

      {/* 使用 DecryptedText 组件显示名字 */}
      <DecryptedText
        text={name}
        speed={50}
        maxIterations={10}
        animateOn="view"
        sequential={true}
        revealDirection="left"
        className="text-6xl font-bold text-white z-20"
        parentClassName="z-20"
      />
    </section>
  );
}
