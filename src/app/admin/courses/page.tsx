"use client";

import { useEffect, useState } from "react";
import { BookOpen, RefreshCw, Plus } from "lucide-react";
import { PopupModal } from "@/components/ui/PopupModal";

export default function AdminCoursesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("4 Years");
  const [feesPerYear, setFeesPerYear] = useState("");
  const [eligibility, setEligibility] = useState("10+2 with 50%");
  const [seats, setSeats] = useState("60");
  const [entranceExam, setEntranceExam] = useState("Merit Based");
  const [saving, setSaving] = useState(false);

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, message: "" });

  function showPopup(message: string, type: "success" | "error" | "info" | "warning" = "success", title?: string) {
    setPopup({ isOpen: true, message, type, title });
  }

  async function fetchColleges() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/colleges");
      const data = await res.json();
      if (data.colleges) {
        setColleges(data.colleges);
        if (data.colleges.length > 0) {
          setSelectedCollegeId(data.colleges[0].id);
        }
      }
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => {
    fetchColleges();
  }, []);

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !feesPerYear || !selectedCollegeId) {
      return showPopup("Please fill all required course fields", "warning", "Validation Error");
    }

    setSaving(true);
    try {
      const college = colleges.find((c) => c.id === selectedCollegeId);
      if (!college) return;

      const updatedCourses = [
        ...(college.courses || []),
        {
          title,
          duration,
          feesPerYear: parseFloat(feesPerYear),
          eligibility,
          seats: parseInt(seats) || 60,
          entranceExam,
        },
      ];

      const res = await fetch(`/api/admin/colleges/${selectedCollegeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...college,
          courses: updatedCourses,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTitle("");
        setFeesPerYear("");
        showPopup(`Course "${title}" added to ${college.name}!`, "success", "Course Registered");
        fetchColleges();
      } else {
        showPopup(data.error || "Failed to add course", "error", "Course Error");
      }
    } catch (e: any) {
      showPopup("Error: " + e.message, "error", "Course Exception");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> Course Directory Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">Add courses to colleges & manage fee structures</p>
        </div>
        <button
          onClick={fetchColleges}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
        </button>
      </div>

      <form onSubmit={handleAddCourse} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" /> Add New Course to College
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Target College *</label>
            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Course Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. B.Tech Computer Science"
              required
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Fees Per Year (₹) *</label>
            <input
              type="number"
              value={feesPerYear}
              onChange={(e) => setFeesPerYear(e.target.value)}
              placeholder="85000"
              required
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="4 Years"
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Eligibility</label>
            <input
              type="text"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="10+2 with 50%"
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Entrance Exam</label>
            <input
              type="text"
              value={entranceExam}
              onChange={(e) => setEntranceExam(e.target.value)}
              placeholder="TNEA / JEE Main"
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            {saving ? "Saving..." : "Add Course"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-5">College</th>
              <th className="py-3.5 px-4">Courses Count</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colleges.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">{c.courses?.length || 0} courses registered</td>
                <td className="py-3.5 px-4 text-right">
                  <a
                    href={`/admin/colleges/${c.id}/edit`}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Manage Courses →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
