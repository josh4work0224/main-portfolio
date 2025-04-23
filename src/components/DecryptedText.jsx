import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

/**
 * DecryptedText
 *
 * Props:
 * - text: string
 * - hoverText?: string (text to show when hovering)
 * - speed?: number
 * - delay?: number (delay in ms before animation starts)
 * - startEmpty?: boolean (whether to start with empty text)
 * - maxIterations?: number
 * - sequential?: boolean
 * - revealDirection?: "start" | "end" | "center"
 * - useOriginalCharsOnly?: boolean
 * - characters?: string
 * - className?: string          (applied to revealed/normal letters)
 * - encryptedClassName?: string (applied to encrypted letters)
 * - parentClassName?: string    (applied to the top-level span container)
 * - animateOn?: "view" | "hover" | "both"
 * - fontSize?: string           (default: 'inherit')
 * - fontWeight?: string | number (default: 'inherit')
 * - mixBlendMode?: string       (default: 'normal')
 */
export default function DecryptedText({
  text = "",
  hoverText = "",
  speed = 100,
  delay = 0,
  startEmpty = false,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  fontSize = "inherit",
  fontWeight = "inherit",
  mixBlendMode = "normal",
  ...props
}) {
  const [displayText, setDisplayText] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Set initial display text based on startEmpty
  useEffect(() => {
    if (startEmpty || (animateOn === "view" && !hasAnimated)) {
      setDisplayText("");
    } else {
      setDisplayText(text);
    }
  }, [startEmpty, animateOn, hasAnimated, text]);

  // Reset animation state when text length changes
  useEffect(() => {
    setRevealedIndices(new Set());
    setIsScrambling(false);
    if (startEmpty || (animateOn === "view" && !hasAnimated)) {
      setDisplayText("");
    } else if (
      animateOn === "hover" ||
      (animateOn === "both" && !hasAnimated)
    ) {
      setDisplayText(text);
    } else {
      setDisplayText(isHovering && hoverText ? hoverText : text);
    }
  }, [isHovering, text, hoverText, animateOn, hasAnimated, startEmpty]);

  useEffect(() => {
    if (animateOn === "view" || animateOn === "both") {
      const observerCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsHovering(true);
            setHasAnimated(true);
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      });

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) observer.unobserve(containerRef.current);
      };
    }
  }, [animateOn, hasAnimated]);

  const hoverProps = {
    onMouseEnter: () => {
      if (animateOn === "hover" || animateOn === "both") {
        setIsHovering(true);
        setIsFirstRender(false);
      }
    },
    onMouseLeave: () => {
      if (animateOn === "hover" || animateOn === "both") {
        setIsHovering(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    },
  };

  useEffect(() => {
    let interval;
    let currentIteration = 0;

    const shouldAnimate =
      (animateOn === "both" && (isHovering || hasAnimated)) ||
      (animateOn === "view" && hasAnimated) ||
      (animateOn === "hover" && isHovering && !isFirstRender);

    const getNextIndex = (revealedSet) => {
      const currentText = isHovering && hoverText ? hoverText : text;
      const textLength = currentText.length;
      switch (revealDirection) {
        case "start":
          return revealedSet.size;
        case "end":
          return textLength - 1 - revealedSet.size;
        case "center": {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex =
            revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

          if (
            nextIndex >= 0 &&
            nextIndex < textLength &&
            !revealedSet.has(nextIndex)
          ) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
      : characters.split("");

    const shuffleText = (originalText, currentRevealed) => {
      if (useOriginalCharsOnly) {
        const positions = originalText.split("").map((char, i) => ({
          char,
          isSpace: char === " ",
          index: i,
          isRevealed: currentRevealed.has(i),
        }));

        const nonSpaceChars = positions
          .filter((p) => !p.isSpace && !p.isRevealed)
          .map((p) => p.char);

        for (let i = nonSpaceChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpaceChars[i], nonSpaceChars[j]] = [
            nonSpaceChars[j],
            nonSpaceChars[i],
          ];
        }

        let charIndex = 0;
        return positions
          .map((p) => {
            if (p.isSpace) return " ";
            if (p.isRevealed) return originalText[p.index];
            return nonSpaceChars[charIndex++];
          })
          .join("");
      } else {
        return originalText
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (currentRevealed.has(i)) return originalText[i];
            return availableChars[
              Math.floor(Math.random() * availableChars.length)
            ];
          })
          .join("");
      }
    };

    const startAnimation = () => {
      if (shouldAnimate) {
        setIsScrambling(true);
        interval = setInterval(() => {
          setRevealedIndices((prevRevealed) => {
            const currentText = isHovering && hoverText ? hoverText : text;
            if (sequential) {
              if (prevRevealed.size < currentText.length) {
                const nextIndex = getNextIndex(prevRevealed);
                const newRevealed = new Set(prevRevealed);
                newRevealed.add(nextIndex);
                setDisplayText(shuffleText(currentText, newRevealed));
                return newRevealed;
              } else {
                clearInterval(interval);
                setIsScrambling(false);
                return prevRevealed;
              }
            } else {
              setDisplayText(shuffleText(currentText, prevRevealed));
              currentIteration++;
              if (currentIteration >= maxIterations) {
                clearInterval(interval);
                setIsScrambling(false);
                setDisplayText(currentText);
              }
              return prevRevealed;
            }
          });
        }, speed);
      }
    };

    if (delay > 0 && shouldAnimate) {
      timeoutRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    isHovering,
    hasAnimated,
    text,
    hoverText,
    speed,
    delay,
    maxIterations,
    sequential,
    revealDirection,
    characters,
    useOriginalCharsOnly,
    animateOn,
    isFirstRender,
  ]);

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      style={{ fontSize, fontWeight, mixBlendMode }}
      {...hoverProps}
      {...props}
    >
      <span className="sr-only">{displayText}</span>

      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const isRevealedOrDone =
            revealedIndices.has(index) || !isScrambling || !isHovering;

          return (
            <span
              key={index}
              className={isRevealedOrDone ? className : encryptedClassName}
              style={{ fontSize: "inherit" }}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
