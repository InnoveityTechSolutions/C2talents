"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";

export default function AdminAllCollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  async function fetchColleges() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/colleges");
      const data = await res.json();
      if (data.colleges) {
        setColleges(data.colleges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchColleges();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setColleges((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert("Failed to delete college.");
    }
  }

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredColleges = colleges.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.shortName && c.shortName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "PUBLISHED") return matchesSearch && c.status === "PUBLISHED";
    if (statusFilter === "DRAFT") return matchesSearch && c.status === "DRAFT";
    if (statusFilter === "FEATURED") return matchesSearch && c.featured;
    return matchesSearch;
  });

  const totalCount = colleges.length;
  const publishedCount = colleges.filter((c) => c.status === "PUBLISHED").length;
  const featuredCount = colleges.filter((c) => c.featured).length;
  const draftCount = colleges.filter((c) => c.status === "DRAFT").length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#3b2075] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#3b2075] flex items-center justify-center shadow-xs">
              <Building2 className="w-4.5 h-4.5 text-[#4c1d95]" />
            </div>
            <span>College Directory</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Manage all portal college listings, AI metadata, & publication status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchColleges}
            className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition-all shadow-xs"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <Link
            href="/manager/colleges/new"
            className="flex items-center gap-2 bg-[#3b2075] hover:bg-[#4c1d95] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Add New College</span>
            <span className="bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </Link>
        </div>
      </div>

      {/* Directory Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#3b2075] flex items-center justify-center font-extrabold text-sm shrink-0">
            {totalCount}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total Colleges</p>
            <p className="text-xs font-extrabold text-stone-900">Active Directory</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-extrabold text-sm shrink-0">
            {publishedCount}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Published</p>
            <p className="text-xs font-extrabold text-stone-900">Live on Site</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center font-extrabold text-sm shrink-0">
            {featuredCount}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Featured</p>
            <p className="text-xs font-extrabold text-stone-900">Homepage Star</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-extrabold text-sm shrink-0">
            {draftCount}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Pending Drafts</p>
            <p className="text-xs font-extrabold text-stone-900">Review Required</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["ALL", "PUBLISHED", "DRAFT", "FEATURED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-[#3b2075] text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {status === "ALL" ? `All (${colleges.length})` : status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name, city, short code..."
            className="w-full bg-stone-50 pl-10 pr-4 py-2 rounded-xl text-xs border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-900 placeholder:text-stone-400 font-medium"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs font-semibold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            Loading college directory...
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-800">No Colleges Found</p>
            <p className="text-xs text-stone-500">Try adjusting your search query or add a new college profile.</p>
            <Link
              href="/admin/colleges/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3b2075] text-white font-bold rounded-xl text-xs shadow-sm hover:bg-[#4c1d95]"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" /> Add College Profile
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/90 text-stone-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5 whitespace-nowrap">College Info</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Location</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Type & NAAC</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-center">NIRF</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Highest Package</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-center">Status</th>
                  <th className="py-3.5 px-5 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredColleges.map((college) => {
                  const hasValidLogo =
                    !brokenImages[college.id] && (college.logo || college.image);

                  return (
                    <tr
                      key={college.id}
                      className="hover:bg-[#f5f3ff] transition-colors group text-stone-800"
                    >
                      {/* College Info */}
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3 max-w-sm">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b2075] to-[#6d28d9] text-white overflow-hidden shrink-0 flex items-center justify-center font-extrabold text-xs shadow-xs border border-purple-700/30">
                            {hasValidLogo ? (
                              <img
                                src={college.logo || college.image}
                                alt={college.name}
                                onError={() => handleImageError(college.id)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (college.shortName || college.name || "C").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-extrabold text-stone-900 truncate max-w-[210px] group-hover:text-[#3b2075]"
                                title={college.name}
                              >
                                {college.name}
                              </span>
                              {college.featured && (
                                <Star
                                  className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0"
                                  title="Featured College"
                                />
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 font-medium truncate max-w-[180px]">
                              {college.shortName || college.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 whitespace-nowrap text-stone-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{college.city || college.location}</span>
                        </div>
                      </td>

                      {/* Type & NAAC */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-800">{college.type || "Private"}</span>
                          {college.naacGrade && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-extrabold">
                              {college.naacGrade}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* NIRF */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {college.nirfRank ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#0a3d34] text-[10px] font-extrabold border border-emerald-200">
                            #{college.nirfRank}
                          </span>
                        ) : (
                          <span className="text-stone-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Highest Package */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-extrabold text-[#4c1d95]">
                        ₹{college.highestPackage || "12.5"} LPA
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            college.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {college.status === "PUBLISHED" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {college.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/colleges/${college.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/manager/colleges/${college.id}/edit`}
                            className="p-1.5 rounded-lg bg-[#3b2075] hover:bg-[#4c1d95] text-white transition-colors"
                            title="Edit College"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-300" />
                          </Link>

                          <button
                            onClick={() => handleDelete(college.id, college.name)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete College"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
