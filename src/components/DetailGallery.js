import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import PixelatedImage from "@/components/PixelatedImage";

const DetailImageSlider = ({ images, onImageClick }) => {
  const wrapperRef = useRef(null);
  const sliderRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const itemsPerView = 2;

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const visibleItems = isMobile ? 1 : itemsPerView;

  const slideToIndex = (index) => {
    if (!sliderRef.current || !wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const slideWidth = wrapper.offsetWidth / visibleItems;

    gsap.to(sliderRef.current, {
      x: -slideWidth * index,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => setIsAnimating(false),
    });
  };

  const handlePrev = () => {
    if (isAnimating || !images || images.length === 0) return;
    const newIndex = visibleStartIndex - 1;
    setIsAnimating(true);
    setVisibleStartIndex(newIndex < 0 ? images.length - 1 : newIndex);
  };

  const handleNext = () => {
    if (isAnimating || !images || images.length === 0) return;
    const newIndex = visibleStartIndex + 1;
    setIsAnimating(true);
    setVisibleStartIndex(newIndex >= images.length ? 0 : newIndex);
  };

  useEffect(() => {
    slideToIndex(visibleStartIndex);
  }, [visibleStartIndex, visibleItems]);

  // --- Drag Logic ---
  useEffect(() => {
    const slider = sliderRef.current;
    const wrapper = wrapperRef.current;
    if (!slider || !wrapper) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      startX.current = e.clientX;
      slider.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      currentX.current = e.clientX;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      slider.style.cursor = "grab";
      const diff = currentX.current - startX.current;
      if (Math.abs(diff) > 50 && !isAnimating) {
        setIsAnimating(true);
        if (diff < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };

    wrapper.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      wrapper.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleNext, handlePrev, isAnimating]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full relative overflow-hidden my-16 flex flex-col">
      <h2 className="px-[2px] py-[1px] bg-white text-slate-700 text-md leading-none uppercase self-start rounded-[2px] mb-6">
        Gallery
      </h2>
      <div ref={wrapperRef} className="overflow-hidden cursor-grab">
        <div
          ref={sliderRef}
          className="flex transition-transform"
          style={{ width: `${(images.length / visibleItems) * 100}%` }}
        >
          {images.map((image, index) => (
            <div
              key={`image-${index}`}
              className="pr-4 box-border"
              style={{ width: `${100 / images.length}%` }}
            >
              <div className="aspect-video overflow-hidden group relative">
                <PixelatedImage
                  src={`https:${image.fields.file.url}`}
                  alt={image.fields.file.title || `Gallery image ${index + 1}`}
                  width={1920}
                  height={1080}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => onImageClick(index)}
                />
                <div className="absolute top-4 right-4 p-2 flex flex-row">
                  <Image
                    src="/assets/search-icon.svg"
                    alt="search-icon"
                    width={50}
                    height={50}
                    className="w-8 aspect-square mix-blend-exclusion"
                  />
                  <div className="group-hover:px-4 text-xl group-hover:w-auto group-hover:opacity-100 opacity-0 w-0 transition-all h-7 overflow-hidden mix-blend-exclusion">
                    <span className="text-nowrap">[Click for the detail]</span>
                  </div>
                  <div className="absolute w-2 h-2 group-hover:h-4 bg-lime-300 right-0 top-0"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > visibleItems && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/80 hover:text-black text-white p-4 md:p-6 rounded-full transition-colors z-10"
            disabled={isAnimating}
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/80 hover:text-black text-white p-4 md:p-6 rounded-full transition-colors z-10 "
            disabled={isAnimating}
          >
            →
          </button>
        </>
      )}

      {images.length > visibleItems && (
        <div className="flex justify-center mt-6 gap-2">
          {images.map((_, i) => (
            <button
              key={`indicator-${i}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === visibleStartIndex ? "bg-white" : "bg-white/30"
              }`}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setVisibleStartIndex(i);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailImageSlider;
