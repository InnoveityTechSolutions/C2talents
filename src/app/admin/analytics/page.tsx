import { db } from "@/lib/db";
import { BarChart3, TrendingUp, Users, Building2, Eye, Award } from "lucide-react";

export const revalidate = 0;

export default async function AnalyticsPage() {
  const [collegesCount, coursesCount, reviewsCount] = await Promise.all([
    db.collegeProfile.count(),
    db.course.count(),
    db.review.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Portal Analytics & Performance
        </h1>
        <p className="text-xs text-stone-500">Realtime student leads, page impressions, and placement stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Monthly Views</span>
          <span className="text-3xl font-extrabold text-stone-900">148,290</span>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">↑ +24.5% vs last month</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Student Applications</span>
          <span className="text-3xl font-extrabold text-stone-900">1,420</span>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">↑ +18.2% conversion rate</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Average Highest CTC</span>
          <span className="text-3xl font-extrabold text-amber-600">₹18.5 LPA</span>
          <span className="text-xs text-stone-500 font-semibold">Across top engineering & MBA colleges</span>
        </div>
      </div>
    </div>
  );
}
