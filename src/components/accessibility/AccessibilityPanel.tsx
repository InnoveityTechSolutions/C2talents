"use client";

import * as React from "react";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { 
  ZoomIn, ZoomOut, Contrast, Eye, Lightbulb, Link as LinkIcon, Type, RotateCcw, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AccessibilityPanel() {
  const {
    settings,
    isPanelOpen,
    setIsPanelOpen,
    updateSetting,
    resetAll
  } = useAccessibility();

  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close panel on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPanelOpen(false);
      }
    };
    if (isPanelOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPanelOpen, setIsPanelOpen]);

  // Trap focus inside panel when open
  React.useEffect(() => {
    if (!isPanelOpen) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleFocusTrap);
    return () => window.removeEventListener("keydown", handleFocusTrap);
  }, [isPanelOpen]);

  const toggleSwitch = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key] as any);
  };

  // Custom SVG Icons to match brand guidelines
  const AccessibilityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
      <path d="M6 10c3-1 9-1 12 0" />
      <path d="M12 10v7" />
      <path d="m9 20 3-3 3 3" />
    </svg>
  );

  const GrayscaleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4.5 h-4.5 text-stone-600 group-hover:text-[#3b2075] transition-colors">
      <line x1="4" y1="4" x2="4" y2="20" />
      <line x1="7" y1="4" x2="7" y2="20" />
      <line x1="10" y1="4" x2="10" y2="20" />
      <line x1="13" y1="4" x2="13" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
      <line x1="20" y1="4" x2="20" y2="20" />
    </svg>
  );

  return (
    <>
      {/* Clickable Backdrop to close panel when clicking outside space */}
      {isPanelOpen && (
        <div
          onClick={() => setIsPanelOpen(false)}
          className="fixed inset-0 z-[9990] bg-black/15 backdrop-blur-[1px] cursor-pointer pointer-events-auto"
          aria-hidden="true"
        />
      )}

      <motion.div
        animate={{ x: isPanelOpen ? 0 : -330 }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="fixed left-0 top-[28%] z-[9995] flex items-start pointer-events-none font-sans select-none"
      >
      {/* Slide-out Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-panel-title"
        className="w-[330px] bg-white border border-stone-200 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.12)] pointer-events-auto flex flex-col p-4.5 z-10 rounded-r-2xl"
      >
        {/* Header */}
        <div className="mb-4 pb-3 border-b border-stone-100">
          <h2 id="accessibility-panel-title" className="text-[15px] font-extrabold text-[#1f0c3d] tracking-wide">
            Accessibility Tools
          </h2>
          <p className="text-[10.5px] text-stone-400 font-medium mt-0.5">
            Customize your browsing experience
          </p>
        </div>

        {/* Buttons List */}
        <div className="space-y-1.5">
          <ToolButton
            icon={ZoomIn}
            label="Increase Text"
            onClick={() => updateSetting("fontSizeMultiplier", Math.min(1.5, settings.fontSizeMultiplier + 0.1))}
            active={settings.fontSizeMultiplier > 1.0}
            statusText={settings.fontSizeMultiplier > 1.0 ? `${Math.round(settings.fontSizeMultiplier * 100)}%` : undefined}
          />
          <ToolButton
            icon={ZoomOut}
            label="Decrease Text"
            onClick={() => updateSetting("fontSizeMultiplier", Math.max(0.8, settings.fontSizeMultiplier - 0.1))}
            active={settings.fontSizeMultiplier < 1.0}
            statusText={settings.fontSizeMultiplier < 1.0 ? `${Math.round(settings.fontSizeMultiplier * 100)}%` : undefined}
          />
          <ToolButton
            customIcon={GrayscaleIcon}
            label="Grayscale"
            onClick={() => toggleSwitch("grayscale")}
            active={settings.grayscale}
          />
          <ToolButton
            icon={Contrast}
            label="High Contrast"
            onClick={() => toggleSwitch("highContrast")}
            active={settings.highContrast}
          />
          <ToolButton
            icon={Eye}
            label="Negative Contrast"
            onClick={() => toggleSwitch("negativeContrast")}
            active={settings.negativeContrast}
          />
          <ToolButton
            icon={Lightbulb}
            label="Light Background"
            onClick={() => updateSetting("theme", settings.theme === "light" ? "default" : "light")}
            active={settings.theme === "light"}
          />
          <ToolButton
            icon={LinkIcon}
            label="Links Underline"
            onClick={() => toggleSwitch("underlineLinks")}
            active={settings.underlineLinks}
          />
          <ToolButton
            icon={Type}
            label="Readable Font"
            onClick={() => toggleSwitch("readableFont")}
            active={settings.readableFont}
          />
          
          {/* Highlighted Reset Button */}
          <button
            onClick={resetAll}
            className="w-full text-left py-2 px-3 mt-3 bg-[#3b2075]/5 text-[#3b2075] border border-[#3b2075]/10 hover:bg-[#3b2075]/10 rounded-xl flex items-center justify-between transition-all cursor-pointer group focus:outline-none focus:ring-1 focus:ring-[#3b2075]"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-xs font-bold font-sans">Reset Accessibility</span>
            </div>
          </button>
        </div>
      </div>

      {/* Floating Tab Button (attached to the right of the panel) */}
      <button
        aria-label="Toggle accessibility tools panel"
        aria-expanded={isPanelOpen}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="accessibility-btn pointer-events-auto flex items-center justify-center w-[46px] h-[46px] bg-[#3b2075] hover:bg-[#2d1659] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b2075] shadow-[4px_0_12px_rgba(0,0,0,0.06)] cursor-pointer rounded-r-2xl border-y border-r border-stone-200/40 flex-shrink-0"
        style={{ marginLeft: "-1px" }}
      >
        <AccessibilityIcon />
      </button>
    </motion.div>
    </>
  );
}

// Tool Button component matching brand design guidelines
interface ToolButtonProps {
  icon?: React.ComponentType<{ className?: string }>;
  customIcon?: () => React.ReactNode;
  label: string;
  onClick: () => void;
  active: boolean;
  statusText?: string;
}

function ToolButton({ icon: Icon, customIcon, label, onClick, active, statusText }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between border-l-3 border-transparent hover:border-l-[#3b2075] hover:bg-stone-50/85 transition-all cursor-pointer group focus:outline-none focus:ring-1 focus:ring-[#3b2075]/40 ${
        active ? "bg-[#3b2075]/5 text-[#3b2075] border-l-[#3b2075]" : "text-stone-750"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex-shrink-0 transition-colors ${
          active ? "text-[#3b2075]" : "text-stone-450 group-hover:text-[#3b2075]"
        }`}>
          {customIcon ? customIcon() : Icon && <Icon className="w-4.5 h-4.5" />}
        </div>
        <span className="text-[12.5px] font-semibold tracking-wide font-sans truncate">{label}</span>
      </div>
      
      {/* Active state indicator */}
      {active && (
        <div className="flex items-center justify-center flex-shrink-0">
          {statusText ? (
            <span className="text-[10px] font-bold bg-[#3b2075] text-white px-1.5 py-0.5 rounded-md">
              {statusText}
            </span>
          ) : (
            <Check className="w-3.5 h-3.5 text-[#3b2075] stroke-[3]" />
          )}
        </div>
      )}
    </button>
  );
}
