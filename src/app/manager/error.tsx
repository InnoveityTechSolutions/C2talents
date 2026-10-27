"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function ManagerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MANAGER ROUTE ERROR]:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
        <AlertTriangle className="w-8 h-8 text-rose-600" />
      </div>
      <h2 className="text-xl font-black text-stone-900 tracking-tight mb-2">
        Something went wrong loading this screen
      </h2>
      <p className="text-xs text-stone-500 max-w-md mb-6 leading-relaxed">
        {error.message || "An unexpected error occurred while rendering the manager console."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2.5 rounded-xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
        <Link
          href="/manager/dashboard"
          className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-2 transition-all"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
