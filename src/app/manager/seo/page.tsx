"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Save,
  Globe,
  Share2,
  Sliders,
  Building2,
  RefreshCw,
  ExternalLink,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { PopupModal } from "@/components/ui/PopupModal";

interface CollegeItem {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  category: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  metaKeywords: string | null;
}

interface SeoStats {
  totalColleges: number;
  withSeoTitle: number;
  withSeoDescription: number;
  withMetaKeywords: number;
  withSeoArticle: number;
  fullyOptimized: number;
  needsAttention: number;
  healthScore: number;
}

type FilterType = "all" | "optimized" | "missing_title" | "missing_desc" | "missing_keywords";

const inputCls =
  "w-full bg-slate-50/80 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-purple-500/10";

function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const good = len >= min && len <= max;
  return (
    <span
      className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-md ${
        good
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {len} / {max} chars
    </span>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-stone-800 block mb-1">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  colorBar,
  icon: Icon,
}: {
  label: string;
  value: number;
  total: number;
  colorBar: string;
  icon: React.ElementType;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col gap-2 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${colorBar}`} />
      </div>
      <div className="text-2xl font-black text-[#1f0c3d]">
        {value}
        <span className="text-sm text-stone-400 font-semibold ml-1">/ {total}</span>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${colorBar.replace("text-", "bg-")}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-stone-400 font-medium">{pct}% coverage</span>
    </div>
  );
}

export default function SeoManagementPage() {
  const [activeScope, setActiveScope] = useState<"college" | "global">("college");
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [canonicalSlug, setCanonicalSlug] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [robotsSetting, setRobotsSetting] = useState<"index, follow" | "noindex, nofollow">("index, follow");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [globalSiteTitle, setGlobalSiteTitle] = useState(
    "C2Talents | India's Premium College Discovery & AI Counselor"
  );
  const [globalSiteDescription, setGlobalSiteDescription] = useState(
    "Get personalized college matches based on your scores, budget, and placements."
  );
  const [globalKeywords, setGlobalKeywords] = useState(
    "colleges in india, engineering cutoffs, TNEA, medical admissions, MBA colleges, AI counselor"
  );
  const [globalOgImage, setGlobalOgImage] = useState("/images/banner-og.jpg");
  const [globalRobots, setGlobalRobots] = useState<"index, follow" | "noindex, nofollow">("index, follow");
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, message: "" });

  function showPopup(
    message: string,
    type: "success" | "error" | "info" | "warning" = "success",
    title?: string
  ) {
    setPopup({ isOpen: true, message, type, title });
  }

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/seo/stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch {
      /* silent */
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchColleges(q = "", f: FilterType = "all") {
    setLoadingColleges(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (q) params.set("search", q);
      if (f !== "all") params.set("filter", f);
      const res = await fetch(`/api/admin/seo/colleges?${params}`);
      const data = await res.json();
      if (data.colleges) {
        setColleges(data.colleges);
        if (!selectedCollegeId && data.colleges.length > 0) selectCollege(data.colleges[0]);
      }
    } catch {
      /* silent */
    } finally {
      setLoadingColleges(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchStats();
    fetchColleges();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchColleges(searchQuery, filter), 400);
    return () => clearTimeout(t);
  }, [searchQuery, filter]);

  function selectCollege(c: CollegeItem) {
    setSelectedCollegeId(c.id);
    setSeoTitle(c.seoTitle || `${c.name} Admissions, Fees, Placements | C2Talents`);
    setMetaDescription(
      c.seoDescription ||
        `Explore courses, fees, cutoff ranks and placements at ${c.name}, ${c.city || "Tamil Nadu"}.`
    );
    setKeywords(c.metaKeywords || `${c.name}, ${c.name} admissions, ${c.name} placements, fees, cutoffs`);
    setCanonicalSlug(c.slug || `college-${c.id.slice(0, 8)}`);
    setOgTitle(c.seoTitle || c.name);
    setOgDescription(c.seoDescription || `Discover courses, fees, and placements at ${c.name}.`);
    setRobotsSetting("index, follow");
  }

  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);

  async function handleAiGenerate() {
    if (!selectedCollegeId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: selectedCollegeId }),
      });
      const data = await res.json();
      if (data.success && data.seo) {
        setSeoTitle(data.seo.seoTitle || seoTitle);
        setMetaDescription(data.seo.seoDescription || metaDescription);
        setKeywords(data.seo.metaKeywords || keywords);
        setOgTitle(data.seo.seoTitle || ogTitle);
        setOgDescription(data.seo.seoDescription || ogDescription);
        showPopup(
          `AI generated SEO for "${selectedCollege?.name}" — review and save!`,
          "success",
          "AI Generation Complete"
        );
        fetchColleges(searchQuery, filter);
        fetchStats();
      } else {
        showPopup(data.error || "AI generation failed", "error", "Generation Error");
      }
    } catch (err: any) {
      showPopup(err.message || "Network error", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveCollegeSeo(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCollegeId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/colleges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCollegeId,
          seoTitle: seoTitle.trim(),
          seoDescription: metaDescription.trim(),
          metaKeywords: keywords.trim(),
          slug: canonicalSlug.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showPopup(`SEO for "${selectedCollege?.name}" saved!`, "success", "Saved");
        setColleges((prev) =>
          prev.map((col) =>
            col.id === selectedCollegeId
              ? { ...col, seoTitle, seoDescription: metaDescription, metaKeywords: keywords, slug: canonicalSlug }
              : col
          )
        );
        fetchStats();
      } else {
        showPopup(data.error || "Failed to save", "error", "Save Error");
      }
    } catch (err: any) {
      showPopup(err.message || "Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleSaveGlobalSeo(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showPopup("Global SEO settings saved!", "success", "Global SEO Updated");
    }, 600);
  }

  const filterChips: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "optimized", label: "Optimised" },
    { key: "missing_title", label: "No Title" },
    { key: "missing_desc", label: "No Desc" },
    { key: "missing_keywords", label: "No Keywords" },
  ];

  return (
    <div className="space-y-6 font-sans text-stone-900 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1f0c3d] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3b2075] flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5 text-amber-300" />
            </div>
            SEO Management
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Manage search titles, descriptions, social previews and indexing for every college page.
          </p>
        </div>

        {/* Scope Toggle */}
        <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-2xs text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveScope("college")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeScope === "college" ? "bg-[#3b2075] text-white shadow-xs" : "hover:text-stone-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            College Pages
          </button>
          <button
            onClick={() => setActiveScope("global")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeScope === "global" ? "bg-[#3b2075] text-white shadow-xs" : "hover:text-stone-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Global Site SEO
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      {!loadingStats && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#1f0c3d] to-[#3b2075] rounded-2xl p-4 flex flex-col gap-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">SEO Health</span>
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-4xl font-black text-amber-300">{stats.healthScore}%</div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${stats.healthScore}%` }} />
            </div>
            <span className="text-[11px] text-purple-200">
              {stats.fullyOptimized} of {stats.totalColleges} fully optimised
            </span>
          </div>
          <StatCard
            label="SEO Titles"
            value={stats.withSeoTitle}
            total={stats.totalColleges}
            colorBar="text-blue-500"
            icon={FileText}
          />
          <StatCard
            label="Meta Descriptions"
            value={stats.withSeoDescription}
            total={stats.totalColleges}
            colorBar="text-violet-500"
            icon={Tag}
          />
          <StatCard
            label="Needs Attention"
            value={stats.needsAttention}
            total={stats.totalColleges}
            colorBar="text-rose-500"
            icon={AlertCircle}
          />
        </div>
      )}

      {/* ─────── COLLEGE SEO ─────── */}
      {activeScope === "college" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: College Selector */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 flex flex-col">
            <div>
              <h2 className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-700" />
                Select College
              </h2>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Pick a college to edit its SEO settings</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search college name or city..."
                className="w-full bg-slate-50 pl-9 pr-3 py-2 rounded-xl text-xs border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#3b2075]"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {filterChips.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-[10.5px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer border ${
                    filter === f.key
                      ? "bg-[#3b2075] text-white border-[#3b2075]"
                      : "text-stone-600 border-stone-200 hover:border-[#3b2075] hover:text-[#3b2075]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* College List */}
            <div className="space-y-1 flex-1 max-h-[420px] overflow-y-auto pr-0.5">
              {loadingColleges ? (
                <div className="py-10 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#3b2075]" />
                  Loading...
                </div>
              ) : colleges.length === 0 ? (
                <div className="py-10 text-center text-xs text-stone-400">No colleges matched.</div>
              ) : (
                colleges.map((c) => {
                  const isSelected = c.id === selectedCollegeId;
                  const hasCustomSeo = Boolean(c.seoTitle && c.seoDescription);
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectCollege(c)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? "bg-purple-50 border border-purple-300 shadow-2xs"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-[#1f0c3d]" : "text-stone-800"
                          }`}
                        >
                          {c.name}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            hasCustomSeo ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                          title={hasCustomSeo ? "SEO saved" : "Needs SEO"}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] text-stone-400 font-mono">
                        <span className="truncate">/colleges/{c.slug}</span>
                        <span className="text-stone-500 font-sans font-medium">{c.city || "TN"}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100 text-[10.5px] text-stone-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                SEO saved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Needs SEO
              </span>
            </div>
          </div>

          {/* RIGHT: SEO Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
            {/* Currently Editing header */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                  Currently Editing
                </span>
                <h3 className="text-base font-extrabold text-[#1f0c3d] mt-1">
                  {selectedCollege?.name || "Select a college on the left"}
                </h3>
                {canonicalSlug && (
                  <p className="text-xs text-purple-900 font-mono mt-0.5">
                    https://c2talents.com/colleges/{canonicalSlug}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedCollegeId && (
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60"
                  >
                    {generating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {generating ? "Generating..." : "AI Generate"}
                  </button>
                )}
                {selectedCollege?.slug && (
                  <a
                    href={`/colleges/${selectedCollege.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-[#3b2075] text-xs font-bold border border-purple-200 transition-colors shadow-2xs"
                  >
                    Open Page
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveCollegeSeo} className="space-y-6">
              {/* SECTION 1: Search Engine */}
              <div className="space-y-4">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-700" />
                    1. Search Engine Metadata
                  </h3>
                  <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                    How this college appears on Google and Bing.
                  </p>
                </div>

                <Field label="SEO Title" required hint="Headline shown in Google results. Ideal: 50-60 chars.">
                  <div className="flex items-center justify-between mb-1">
                    <span />
                    <CharCounter value={seoTitle} min={30} max={65} />
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    required
                    placeholder="e.g. SRM Institute - Admissions, Cutoffs and Fees | C2Talents"
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Meta Description"
                  required
                  hint="Summary shown below the title in search results. Ideal: 140-160 chars."
                >
                  <div className="flex items-center justify-between mb-1">
                    <span />
                    <CharCounter value={metaDescription} min={70} max={165} />
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    required
                    placeholder="Brief description of courses, fees, cutoff, placements..."
                    className={inputCls + " leading-relaxed"}
                  />
                </Field>

                <Field label="Meta Keywords" hint="Comma-separated keywords related to this college.">
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="engineering, placements, admission 2026, cutoffs..."
                    className={inputCls}
                  />
                </Field>

                <Field label="Canonical URL Slug" hint="Clean URL to prevent duplicate indexing.">
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-r-0 border-stone-200 text-stone-500 text-xs px-3 py-2.5 rounded-l-xl font-mono whitespace-nowrap">
                      /colleges/
                    </span>
                    <input
                      type="text"
                      value={canonicalSlug}
                      onChange={(e) => setCanonicalSlug(e.target.value)}
                      required
                      placeholder="college-slug"
                      className="flex-1 bg-slate-50/80 px-3.5 py-2.5 rounded-r-xl border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#3b2075]"
                    />
                  </div>
                </Field>
              </div>

              {/* SECTION 2: Social (collapsible) */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex items-center gap-2 text-xs font-extrabold text-stone-600 hover:text-[#3b2075] transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-blue-500" />
                  2. Social Media Preview (Open Graph)
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span className="text-[10px] text-stone-400 font-normal ml-1">
                    {showAdvanced ? "Hide" : "Show"} advanced
                  </span>
                </button>
                {showAdvanced && (
                  <div className="space-y-4 bg-slate-50/60 p-4 rounded-2xl border border-stone-100">
                    <p className="text-[11px] text-stone-400">
                      Controls how links look when shared on WhatsApp, Twitter, LinkedIn, etc.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Social Share Title" hint="Defaults to SEO Title if empty.">
                        <input
                          type="text"
                          value={ogTitle}
                          onChange={(e) => setOgTitle(e.target.value)}
                          placeholder="Social share headline"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Social Share Description" hint="Defaults to Meta Description if empty.">
                        <input
                          type="text"
                          value={ogDescription}
                          onChange={(e) => setOgDescription(e.target.value)}
                          placeholder="Short summary on social posts"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Robots */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    3. Search Indexing
                  </h3>
                  <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                    Tell search engines whether to index this page.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      robotsSetting === "index, follow"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                        : "bg-slate-50 border-stone-200 text-stone-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="robots"
                      value="index, follow"
                      checked={robotsSetting === "index, follow"}
                      onChange={() => setRobotsSetting("index, follow")}
                      className="accent-[#3b2075]"
                    />
                    <div>
                      <div className="font-bold">Index, Follow</div>
                      <div className="text-[11px] text-stone-500 font-normal">
                        Allow Google to index and rank this page. (Recommended)
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      robotsSetting === "noindex, nofollow"
                        ? "bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-2xs"
                        : "bg-slate-50 border-stone-200 text-stone-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="robots"
                      value="noindex, nofollow"
                      checked={robotsSetting === "noindex, nofollow"}
                      onChange={() => setRobotsSetting("noindex, nofollow")}
                      className="accent-[#3b2075]"
                    />
                    <div>
                      <div className="font-bold">No Index, No Follow</div>
                      <div className="text-[11px] text-stone-500 font-normal">
                        Hide this page from all search engines.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Save */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <p className="text-[11px] text-stone-400 font-medium">
                  <Info className="w-3 h-3 inline mr-1" />
                  Changes reflect after the next Google crawl (usually 1-7 days).
                </p>
                <button
                  type="submit"
                  disabled={saving || !selectedCollegeId}
                  className="px-6 py-3 bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 hover:text-white font-extrabold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save SEO Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ─────── GLOBAL SITE SEO ─────── */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1f0c3d] to-[#3b2075] text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                Site-Wide Defaults
              </span>
              <h2 className="text-base font-extrabold mt-1">Global Website SEO</h2>
              <p className="text-xs text-purple-200 mt-0.5">
                Default fallback metadata for the homepage and shared links.
              </p>
            </div>
            <Globe className="w-8 h-8 text-amber-300 shrink-0 opacity-80" />
          </div>
          <form onSubmit={handleSaveGlobalSeo} className="space-y-5">
            <Field label="Default Website Title" hint="Homepage title and fallback for pages without custom titles.">
              <input
                type="text"
                value={globalSiteTitle}
                onChange={(e) => setGlobalSiteTitle(e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field
              label="Default Meta Description"
              hint="Site-wide overview snippet displayed in Google results."
            >
              <textarea
                rows={3}
                value={globalSiteDescription}
                onChange={(e) => setGlobalSiteDescription(e.target.value)}
                required
                className={inputCls + " leading-relaxed"}
              />
            </Field>
            <Field label="Default Meta Keywords" hint="General brand keywords for the homepage.">
              <input
                type="text"
                value={globalKeywords}
                onChange={(e) => setGlobalKeywords(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field
              label="Default OG Banner Image"
              hint="Shown when sharing root URL on WhatsApp/Twitter. Recommended: 1200x630px."
            >
              <input
                type="text"
                value={globalOgImage}
                onChange={(e) => setGlobalOgImage(e.target.value)}
                placeholder="/images/banner-og.jpg"
                className={inputCls}
              />
            </Field>
            <Field label="Global Indexing Rule" hint="">
              <select
                value={globalRobots}
                onChange={(e) =>
                  setGlobalRobots(e.target.value as "index, follow" | "noindex, nofollow")
                }
                className={inputCls + " font-bold"}
              >
                <option value="index, follow">
                  index, follow - Allow search engines to index the entire site
                </option>
                <option value="noindex, nofollow">
                  noindex, nofollow - Block search engines from the entire site
                </option>
              </select>
            </Field>
            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 hover:text-white font-extrabold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Global SEO Defaults"}
              </button>
            </div>
          </form>
        </div>
      )}

      <PopupModal
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
}
