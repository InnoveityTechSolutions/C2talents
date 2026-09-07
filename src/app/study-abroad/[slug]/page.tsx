"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Landmark,
  DollarSign,
  Calendar,
  ShieldCheck,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Users,
  Search,
  ArrowRight,
  HelpCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EligibilityModal } from "@/components/study-abroad/EligibilityModal";

export default function CountryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || "usa";

  const [loading, setLoading] = React.useState(true);
  const [country, setCountry] = React.useState<any>(null);
  const [universities, setUniversities] = React.useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [isEligibilityOpen, setIsEligibilityOpen] = React.useState(false);

  React.useEffect(() => {
    fetchCountryData(selectedCourse);
  }, [slug, selectedCourse]);

  async function fetchCountryData(courseFilter: string = "") {
    setLoading(true);
    try {
      const url = `/api/study-abroad/countries/${slug}${courseFilter ? `?course=${encodeURIComponent(courseFilter)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Failed response status:", res.status);
        setCountry(null);
        return;
      }
      const data = await res.json();

      if (data.success) {
        setCountry(data.country);
        setUniversities(data.universities || []);
      } else {
        setCountry(null);
      }
    } catch (err) {
      console.error("Failed to load country detail:", err);
      setCountry(null);
    } finally {
      setLoading(false);
    }
  }

  function handleCourseSelect(courseName: string) {
    if (selectedCourse === courseName) {
      setSelectedCourse("");
    } else {
      setSelectedCourse(courseName);
    }
  }

  if (loading && !country) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3b2075] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#1f0c3d] tracking-wider uppercase">Loading Destination Guide...</p>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-2xl font-serif font-bold text-[#1f0c3d]">Country Not Found</h2>
        <p className="text-sm text-stone-500 max-w-md">
          The requested study abroad destination page could not be located.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#3b2075] text-white font-bold text-xs rounded-xl hover:bg-[#ea580c] transition-colors"
        >
          Return to Home Page
        </Link>
      </div>
    );
  }

  const why = country.whyStudy || {};
  const costs = country.costBreakdown || {};
  const reqs = country.admissionRequirements || {};
  const visa = country.visaGuide || {};
  const scholarshipsList = country.scholarships || [];
  const intakesList = country.intakes || [];
  const coursesList: string[] = country.popularCourses || [];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 font-sans selection:bg-purple-200">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#1f0c3d] text-white py-20 px-6 overflow-hidden border-b border-[#3b2075]/50">
        {/* Background Visual Overlay */}
        <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
          <img
            src={country.heroImage}
            alt={country.name}
            className="w-full h-full object-cover object-center filter contrast-125"
          />
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-200/80">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-300">Study Abroad</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">{country.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                <span className="text-base">{country.flag}</span>
                <span>International Study Destination</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight">
                STUDY IN THE <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-purple-300 bg-clip-text text-transparent">{country.name.toUpperCase()}</span>
              </h1>

              <p className="text-base sm:text-lg text-purple-100/90 max-w-2xl font-sans leading-relaxed">
                {country.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#universities"
                  className="px-7 py-3.5 rounded-2xl bg-[#ea580c] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Explore Universities</span>
                </a>

                <button
                  onClick={() => setIsEligibilityOpen(true)}
                  className="px-7 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-extrabold text-xs uppercase tracking-wider transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Check My Eligibility</span>
                </button>
              </div>
            </div>

            {/* Right Hero Stat Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-1">
                <Landmark className="w-5 h-5 text-amber-300" />
                <span className="text-xl font-bold text-white block">{country.universityCount}</span>
                <span className="text-[11px] text-purple-200 uppercase font-semibold">Institutions</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-1">
                <DollarSign className="w-5 h-5 text-amber-300" />
                <span className="text-xl font-bold text-white block">{country.averageTuition}</span>
                <span className="text-[11px] text-purple-200 uppercase font-semibold">Average Tuition</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-1">
                <Calendar className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-bold text-white block">{country.popularIntakes}</span>
                <span className="text-[11px] text-purple-200 uppercase font-semibold">Popular Intakes</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white block">Verified Visa Path</span>
                <span className="text-[11px] text-purple-200 uppercase font-semibold">Post-Study Work</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COUNTRY OVERVIEW */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-900/5 text-[#3b2075] border border-purple-900/15 text-[11px] font-extrabold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Destination Spotlight</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1f0c3d]">
            Why Study in {country.name}?
          </h2>
          <p className="text-sm text-stone-500 font-sans">
            Comprehensive overview of academic standards, career acceleration, and student environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {why.academicReputation && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3 shadow-xs hover:border-[#3b2075]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#3b2075]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">Academic Reputation</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{why.academicReputation}</p>
            </div>
          )}

          {why.careerOpportunities && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3 shadow-xs hover:border-[#3b2075]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#ea580c]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">Career & Post-Study Work</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{why.careerOpportunities}</p>
            </div>
          )}

          {why.popularDestinations && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3 shadow-xs hover:border-[#3b2075]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#3b2075]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">Popular Education Hubs</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{why.popularDestinations}</p>
            </div>
          )}

          {why.internationalEnvironment && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3 shadow-xs hover:border-[#3b2075]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#ea580c]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">International Student Community</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{why.internationalEnvironment}</p>
            </div>
          )}

          {why.researchOpportunities && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3 shadow-xs hover:border-[#3b2075]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#3b2075]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">Research & Innovation</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{why.researchOpportunities}</p>
            </div>
          )}

          {why.postStudyOpportunities && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3 shadow-xs hover:border-[#3b2075]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#ea580c]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">Long-term Migration Pathways</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{why.postStudyOpportunities}</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. POPULAR COURSES & COURSE + COUNTRY FILTERING */}
      <section className="py-16 px-6 bg-white border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-extrabold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Course & Discipline Finder</span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#1f0c3d]">
                Popular Courses in {country.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-sans">
                Click a course below to filter top universities offering that specific discipline in {country.name}.
              </p>
            </div>

            {selectedCourse && (
              <button
                onClick={() => setSelectedCourse("")}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
              >
                Clear Filter ({selectedCourse})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {coursesList.map((courseName) => {
              const isSelected = selectedCourse === courseName;
              return (
                <button
                  key={courseName}
                  onClick={() => handleCourseSelect(courseName)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#3b2075] text-white border-[#3b2075] shadow-md scale-105"
                      : "bg-stone-50 hover:bg-purple-50/60 text-stone-700 border-stone-200"
                  }`}
                >
                  <span>{courseName}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TOP UNIVERSITIES */}
      <section id="universities" className="py-20 px-6 max-w-7xl mx-auto space-y-10">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-900/5 text-[#3b2075] border border-purple-900/15 text-[11px] font-extrabold uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Institutional Showcase</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1f0c3d]">
            Top Universities in {country.name}
          </h2>
          <p className="text-sm text-stone-500 font-sans">
            {selectedCourse
              ? `Showing top institutions offering ${selectedCourse} in ${country.name}`
              : `Explore leading institutions, tuition structures, and available program tracks.`}
          </p>
        </div>

        {universities.length === 0 ? (
          <div className="p-10 text-center bg-white border border-stone-200 rounded-3xl space-y-3">
            <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-stone-800 text-base">No Matching Universities Found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              No institutions currently match the selected course filter &quot;{selectedCourse}&quot;. Try clearing the filter to view all institutions.
            </p>
            <button
              onClick={() => setSelectedCourse("")}
              className="px-5 py-2 bg-[#3b2075] text-white text-xs font-bold rounded-xl"
            >
              Show All Universities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {universities.map((uni) => (
              <div
                key={uni.id}
                className="bg-white border border-stone-200/90 hover:border-[#3b2075]/40 rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Bar: Location + Rank */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#3b2075] bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-xl">
                      {uni.type || "University"}
                    </span>

                    {uni.nirfRank && (
                      <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                        Rank #{uni.nirfRank}
                      </span>
                    )}
                  </div>

                  {/* Image Header */}
                  <div className="relative w-full h-36 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200/70">
                    <img
                      src={uni.image || country.heroImage}
                      alt={uni.name}
                      className="w-full h-full object-cover filter contrast-[1.05]"
                    />
                  </div>

                  {/* Uni Name & Location */}
                  <div>
                    <h3 className="font-serif font-bold text-[#1f0c3d] text-lg leading-snug">
                      {uni.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-semibold mt-1">
                      📍 {uni.location}
                    </p>
                  </div>

                  {/* Course Tracks */}
                  {uni.courses && uni.courses.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider block">
                        Popular Tracks:
                      </span>
                      <div className="space-y-1">
                        {uni.courses.slice(0, 2).map((c: any) => (
                          <div key={c.id || c.title} className="text-xs font-semibold text-stone-800 flex items-center justify-between">
                            <span className="truncate max-w-[200px]">• {c.title}</span>
                            <span className="text-[11px] text-stone-500 font-mono">{c.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Info & Actions */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-semibold">Est. Tuition:</span>
                    <span className="font-bold text-[#ea580c]">
                      {uni.feesPerYear ? `₹${(uni.feesPerYear / 100000).toFixed(1)}L / yr` : country.averageTuition}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/colleges/${uni.slug || uni.id}`}
                      className="py-2.5 border border-stone-300 hover:bg-[#3b2075] hover:border-[#3b2075] hover:text-white active:bg-[#3b2075] active:border-[#3b2075] active:text-white focus:bg-[#3b2075] focus:text-white text-stone-700 font-bold text-xs rounded-xl text-center transition-all cursor-pointer active:scale-[0.98]"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => setIsEligibilityOpen(true)}
                      className="py-2.5 bg-[#3b2075] hover:bg-[#ea580c] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-xs cursor-pointer"
                    >
                      Check Eligibility
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. COST INFORMATION */}
      <section className="py-16 px-6 bg-white border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-extrabold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>Financial Planning</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#1f0c3d]">
              Estimated Cost Breakdown ({country.code})
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              All values represent estimated annual budget ranges. Actual expenses depend on institutional tier and lifestyle choices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3b2075]">Tuition Fees</span>
              <p className="text-xl font-extrabold text-[#1f0c3d]">{costs.tuitionFee || country.averageTuition}</p>
              <p className="text-xs text-stone-500">Public vs Private university degree level variance.</p>
            </div>

            <div className="p-6 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">Living Expenses</span>
              <p className="text-xl font-extrabold text-[#1f0c3d]">{costs.livingExpenses || "₹8L - ₹14L / year"}</p>
              <p className="text-xs text-stone-500">Includes meals, transport, utilities & personal expenses.</p>
            </div>

            <div className="p-6 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900">Accommodation & Health</span>
              <p className="text-xl font-extrabold text-[#1f0c3d]">{costs.accommodation || "₹5L - ₹9L / year"}</p>
              <p className="text-xs text-stone-500">On-campus dormitories or shared off-campus apartments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ADMISSION REQUIREMENTS */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-900/5 text-[#3b2075] border border-purple-900/15 text-[11px] font-extrabold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Entry Guidelines</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1f0c3d]">
            Admission Requirements for {country.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-base text-[#1f0c3d] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#ea580c]" />
              <span>Academic Qualifications</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">{reqs.academicQualification}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-base text-[#1f0c3d] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#3b2075]" />
              <span>English Language Requirements</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">{reqs.englishTest}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-base text-[#1f0c3d] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#ea580c]" />
              <span>Required Documentation</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">{reqs.requiredDocuments}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-base text-[#1f0c3d] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#3b2075]" />
              <span>Standardized Tests & Process</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">{reqs.standardizedTests || reqs.applicationProcess}</p>
          </div>
        </div>
      </section>

      {/* 7. INTAKES TIMELINE */}
      <section className="py-16 px-6 bg-white border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-extrabold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Academic Timelines</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#1f0c3d]">
              Admission Intakes Timeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {intakesList.map((item: any, idx: number) => (
              <div key={idx} className="p-6 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-3 relative overflow-hidden">
                <div className="w-2 h-full bg-[#3b2075] absolute left-0 top-0" />
                <span className="text-xs font-extrabold text-[#ea580c] uppercase tracking-wider block">{item.month}</span>
                <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">{item.name}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. VISA INFORMATION */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="bg-[#1f0c3d] text-white p-8 sm:p-10 rounded-3xl space-y-6 relative overflow-hidden shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Student Visa Guidance</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-white">
              {visa.visaType || `${country.name} Student Visa Guide`}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">General Application Steps</h4>
              <p className="text-xs text-purple-100/90 leading-relaxed">{visa.process}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Required Visa Documentation</h4>
              <p className="text-xs text-purple-100/90 leading-relaxed">{visa.requiredDocuments}</p>
            </div>
          </div>

          {visa.officialUrl && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-purple-800/60">
              <a
                href={visa.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 hover:text-white transition-colors"
              >
                <span>Official Government Immigration Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[10.5px] text-purple-200/70 max-w-md font-sans">
                ⚠️ {visa.disclaimer}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 9. SCHOLARSHIPS */}
      <section className="py-16 px-6 bg-white border-t border-stone-200/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-900/5 text-[#3b2075] border border-purple-900/15 text-[11px] font-extrabold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Financial Aid & Fellowships</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#1f0c3d]">
              Scholarships for International Students
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarshipsList.map((sch: any, idx: number) => (
              <div key={idx} className="p-6 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase text-[#3b2075] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    {sch.provider}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Verified Award
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1f0c3d]">{sch.name}</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">{sch.eligibility}</p>
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-[#ea580c]">
                  <span>Funding: {sch.funding}</span>
                  {sch.officialUrl && (
                    <a
                      href={sch.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b2075] hover:underline flex items-center gap-1"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. ELIGIBILITY ASSESSMENT MODAL */}
      <EligibilityModal
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        defaultCountry={country.name}
        defaultCourse={selectedCourse || coursesList[0] || "Computer Science"}
      />
    </div>
  );
}
