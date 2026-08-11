"use client";

import { useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Code,
  Maximize2,
  Minimize2,
  FileText
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({ label, value, onChange, placeholder, rows = 4 }: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const val = value || "";
    onChange(`${val}${prefix}Sample Text${suffix}`);
  };

  return (
    <div className={`space-y-1.5 ${isFullscreen ? "fixed inset-4 z-50 bg-stone-900 p-6 rounded-2xl border border-stone-700 shadow-2xl flex flex-col" : ""}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-teal-400" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1 transition"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isFullscreen ? "Close" : "Expand"}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-stone-950 p-1.5 rounded-t-xl border border-stone-800 border-b-0 text-stone-400 text-xs">
        <button
          type="button"
          onClick={() => insertFormatting("**", "**")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("*", "*")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-stone-800 mx-1" />
        <button
          type="button"
          onClick={() => insertFormatting("\n## ")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("\n### ")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-stone-800 mx-1" />
        <button
          type="button"
          onClick={() => insertFormatting("\n• ")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("\n1. ")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("\n> ")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting("`", "`")}
          className="p-1.5 hover:bg-stone-800 hover:text-stone-100 rounded transition"
          title="Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Textarea */}
      <textarea
        rows={isFullscreen ? 20 : rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter detailed ${label.toLowerCase()} content...`}
        className={`w-full bg-stone-900 border border-stone-800 rounded-b-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-teal-500 transition font-sans ${isFullscreen ? "flex-1 resize-none" : ""}`}
      />
    </div>
  );
}
