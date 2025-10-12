import { useState, useEffect, useRef } from "react";

interface UseTypingEffectOptions {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
}

export function useTypingEffect({
  text,
  speed = 25,
  onComplete,
}: UseTypingEffectOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Update onComplete ref when it changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Reset when text changes
    indexRef.current = 0;
    setDisplayedText("");
    setIsTyping(true);

    if (!text) {
      setIsTyping(false);
      return;
    }

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}
