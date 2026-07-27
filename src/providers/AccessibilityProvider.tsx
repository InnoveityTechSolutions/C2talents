"use client";

import * as React from "react";

export interface AccessibilitySettings {
  fontSizeMultiplier: number;
  highContrast: boolean;
  theme: "default" | "dark" | "light";
  grayscale: boolean;
  negativeContrast: boolean;
  readableFont: boolean;
  underlineLinks: boolean;
  highlightLinks: boolean;
  biggerCursor: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  hideImages: boolean;
  reduceMotion: boolean;
  pauseAnimations: boolean;
  language: "en" | "ta";
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSizeMultiplier: 1.0,
  highContrast: false,
  theme: "default",
  grayscale: false,
  negativeContrast: false,
  readableFont: false,
  underlineLinks: false,
  highlightLinks: false,
  biggerCursor: false,
  readingGuide: false,
  readingMask: false,
  hideImages: false,
  reduceMotion: false,
  pauseAnimations: false,
  language: "en",
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetAll: () => void;
  
  // Text to Speech Controls
  ttsState: {
    isPlaying: boolean;
    isPaused: boolean;
    rate: number;
  };
  playTTS: () => void;
  pauseTTS: () => void;
  resumeTTS: () => void;
  stopTTS: () => void;
  setTTSRate: (rate: number) => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Body scroll lock effect
  React.useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPanelOpen]);

  // Mouse Coordinates for Reading Guide & Reading Mask
  const [mouseY, setMouseY] = React.useState(0);

  // Text-To-Speech References
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [ttsRate, setTtsRate] = React.useState(1.0);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  // Handle SSR hydration
  React.useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("c2_accessibility_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse accessibility settings", e);
      }
    }
  }, []);

  // Update localStorage and DOM classes when settings change
  React.useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("c2_accessibility_settings", JSON.stringify(settings));

    const html = document.documentElement;

    // 1. Font Size Multiplier
    html.style.fontSize = settings.fontSizeMultiplier === 1.0 ? "" : `${settings.fontSizeMultiplier}rem`;

    // Helper to toggle classes
    const toggleClass = (className: string, condition: boolean) => {
      if (condition) {
        html.classList.add(className);
      } else {
        html.classList.remove(className);
      }
    };

    // 2. High Contrast
    toggleClass("accessibility-high-contrast", settings.highContrast);

    // 3. Dark / Light Theme
    toggleClass("accessibility-dark", settings.theme === "dark");
    toggleClass("accessibility-light", settings.theme === "light");

    // 4. Grayscale
    toggleClass("accessibility-grayscale", settings.grayscale);

    // 5. Negative Contrast
    toggleClass("accessibility-negative-contrast", settings.negativeContrast);

    // 6. Readable Font
    toggleClass("accessibility-readable-font", settings.readableFont);

    // 7. Underline Links
    toggleClass("accessibility-underline-links", settings.underlineLinks);

    // 8. Highlight Links
    toggleClass("accessibility-highlight-links", settings.highlightLinks);

    // 9. Bigger Cursor
    toggleClass("accessibility-bigger-cursor", settings.biggerCursor);

    // 10. Hide Images
    toggleClass("accessibility-hide-images", settings.hideImages);

    // 11. Reduce Motion / Pause Animations
    toggleClass("accessibility-reduce-motion", settings.reduceMotion || settings.pauseAnimations);

  }, [settings, isMounted]);

  // Track Mouse movement for Reading Guide / Mask
  React.useEffect(() => {
    if (!settings.readingGuide && !settings.readingMask) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [settings.readingGuide, settings.readingMask]);

  // TTS implementation
  const stopTTS = React.useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const playTTS = React.useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    stopTTS();

    // Get text from selection or fall back to main content text
    let textToRead = window.getSelection()?.toString();
    if (!textToRead) {
      // Fallback: read main main-content text or body text
      const main = document.querySelector("main") || document.body;
      textToRead = main.innerText;
    }

    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = ttsRate;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  }, [ttsRate, stopTTS]);

  const pauseTTS = React.useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const resumeTTS = React.useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  const setTTSRate = React.useCallback((rate: number) => {
    setTtsRate(rate);
    if (utteranceRef.current && typeof window !== "undefined" && window.speechSynthesis) {
      // To change rate on the fly we need to stop and start again
      const wasPlaying = isPlaying && !isPaused;
      if (wasPlaying) {
        stopTTS();
        setTimeout(() => playTTS(), 100);
      }
    }
  }, [isPlaying, isPaused, stopTTS, playTTS]);

  // Clean up TTS on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const updateSetting = React.useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = React.useCallback(() => {
    // Reset TTS
    stopTTS();

    // Reset settings state
    setSettings(DEFAULT_SETTINGS);

    // Clear caches/storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("c2_accessibility_settings");
      localStorage.clear();
      sessionStorage.clear();
    }
  }, [stopTTS]);

  const value = React.useMemo(() => ({
    settings,
    isPanelOpen,
    setIsPanelOpen,
    updateSetting,
    resetAll,
    ttsState: {
      isPlaying,
      isPaused,
      rate: ttsRate,
    },
    playTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
    setTTSRate,
  }), [
    settings,
    isPanelOpen,
    updateSetting,
    resetAll,
    isPlaying,
    isPaused,
    ttsRate,
    playTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
    setTTSRate,
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}

      {/* Reading Guide Line Overlay */}
      {isMounted && settings.readingGuide && (
        <div
          className="fixed left-0 right-0 h-1 bg-[#7B1E2B] z-[9999] pointer-events-none shadow-[0_0_10px_#7B1E2B]"
          style={{ top: `${mouseY}px`, transform: "translateY(-50%)" }}
          aria-hidden="true"
        />
      )}

      {/* Reading Mask Overlay */}
      {isMounted && settings.readingMask && (
        <>
          <div
            className="fixed top-0 left-0 right-0 bg-black/60 z-[9998] pointer-events-none"
            style={{ height: `${Math.max(0, mouseY - 60)}px` }}
            aria-hidden="true"
          />
          <div
            className="fixed bottom-0 left-0 right-0 bg-black/60 z-[9998] pointer-events-none"
            style={{ top: `${mouseY + 60}px` }}
            aria-hidden="true"
          />
        </>
      )}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
