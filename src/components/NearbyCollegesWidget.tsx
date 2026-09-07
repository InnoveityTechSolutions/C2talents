"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Building2, ChevronRight } from "lucide-react";

interface NearbyCollegeItem {
  id: string;
  name: string;
  shortName?: string;
  slug?: string;
  location: string;
  city: string;
  image?: string;
  logo?: string;
  category?: string;
  type?: string;
  distanceKm: number;
  distanceText: string;
}

interface Props {
  collegeId: string;
  currentCollegeName?: string;
}

export function NearbyCollegesWidget({ collegeId }: Props) {
  const [nearbyColleges, setNearbyColleges] = React.useState<NearbyCollegeItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchNearby() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/colleges/${encodeURIComponent(collegeId)}/nearby`);
        if (!res.ok) throw new Error("Failed to load nearby colleges");
        const data = await res.json();
        if (isMounted) {
          setNearbyColleges(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (collegeId) {
      fetchNearby();
    }
    return () => {
      isMounted = false;
    };
  }, [collegeId]);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 md:p-5 space-y-4 shadow-xs font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#2e266f]" />
          <span>More Nearby Colleges</span>
        </h3>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-[#2e266f] border border-purple-200 uppercase tracking-wider">
          Geolocation
        </span>
      </div>

      {/* Body State */}
      {loading ? (
        <div className="py-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-stone-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-stone-100 rounded w-3/4" />
                <div className="h-2.5 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error || nearbyColleges.length === 0 ? (
        <div className="py-6 text-center space-y-1.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-stone-700">Nearby college information is currently unavailable.</p>
          <p className="text-[11px] text-stone-400">No verified coordinates found within geographical range.</p>
        </div>
      ) : (
        <div className="space-y-2 divide-y divide-stone-50">
          {nearbyColleges.map((c) => (
            <Link
              key={c.id}
              href={`/colleges/${c.slug || c.id}`}
              className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group hover:bg-purple-50/50 p-1.5 -mx-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={c.logo || c.image || "/images/campus-hero.jpg"}
                  alt={c.name}
                  className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#2e266f] truncate leading-snug">
                    {c.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5 flex-wrap">
                    <span className="truncate text-stone-600">{c.city}</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-md">
                      <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{c.distanceText}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-stone-400 group-hover:text-[#2e266f] group-hover:translate-x-0.5 transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
