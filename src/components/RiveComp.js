"use client";
import { useEffect, useRef } from "react";
import { Rive } from "@rive-app/canvas";

export default function YourComponent() {
  const canvasRef = useRef(null);
  const riveRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const loadRive = async () => {
      try {
        const r = new Rive({
          src: "/animations/oval_animation.riv",
          canvas: canvasRef.current,
          autoplay: true,
          stateMachines: "State Machine 1", // If using state machines
        });

        riveRef.current = r;
      } catch (err) {
        console.error("Failed to load Rive animation:", err);
      }
    };

    loadRive();

    return () => {
      if (riveRef.current) {
        riveRef.current.cleanup();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width="1920"
      height="1080"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
