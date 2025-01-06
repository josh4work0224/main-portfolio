"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

function PixelatedImage({
  src,
  alt,
  width = 1920,
  height = 1080,
  className = "object-cover",
  onClick,
  initialPixelSize = 128,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const renderPixelated = useCallback(
    (ctx, image, pixelSize) => {
      if (!ctx || !image) return;

      const scale = Math.max(1, Math.floor(pixelSize / 2));
      const scaledWidth = Math.ceil(width / scale);
      const scaledHeight = Math.ceil(height / scale);

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;

      // Calculate aspect ratios
      const imageAspectRatio = image.width / image.height;
      const canvasAspectRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imageAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas
        drawHeight = scaledHeight;
        drawWidth = scaledHeight * imageAspectRatio;
        offsetX = (scaledWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than canvas
        drawWidth = scaledWidth;
        drawHeight = scaledWidth / imageAspectRatio;
        offsetX = 0;
        offsetY = (scaledHeight - drawHeight) / 2;
      }

      // Draw the image on the smaller canvas
      tempCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        scaledWidth,
        scaledHeight,
        0,
        0,
        width,
        height
      );

      tempCanvas.remove();
    },
    [width, height]
  );

  useEffect(() => {
    let animation;

    const initGSAP = async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");

        gsap.registerPlugin(ScrollTrigger);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        const image = new Image();
        image.crossOrigin = "anonymous";

        if (!src.startsWith("http")) {
          image.src = `https:${src}`;
        } else {
          image.src = src;
        }

        image.onload = () => {
          setImageLoaded(true);
          renderPixelated(ctx, image, initialPixelSize);

          // 減少更新頻率
          animation = gsap.to(
            {},
            {
              pixelSize: 1,
              duration: 1,
              paused: true,
              onUpdate: function () {
                // 只在較大的步進值更新
                const currentPixelSize = Math.max(
                  1,
                  Math.round(initialPixelSize * (1 - this.progress()))
                );
                if (currentPixelSize % 2 === 0 || currentPixelSize <= 4) {
                  renderPixelated(ctx, image, currentPixelSize);
                }
              },
              ease: "power1.out",
            }
          );

          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top 80%",
            onEnter: () => {
              animation?.play();
            },
            once: true,
          });
        };

        image.onerror = (error) => {
          console.error("Error loading image:", error);
          setImageLoaded(true);
        };
      } catch (error) {
        console.error("Error initializing GSAP:", error);
      }
    };

    if (typeof window !== "undefined") {
      initGSAP();
    }

    return () => {
      if (typeof window !== "undefined") {
        import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        });
      }
      if (animation) {
        animation.kill();
      }
    };
  }, [src, width, height, initialPixelSize, renderPixelated]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

export default PixelatedImage;
