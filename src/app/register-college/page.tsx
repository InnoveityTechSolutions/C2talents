"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Award,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Check,
  CheckSquare,
} from "lucide-react";

export default function CollegeRegistrationPage() {
  const [formData, setFormData] = useState({
    collegeName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    website: "",
    location: "",
    type: "Private",
    feesPerYear: "Flexible / Varies by Course",
    additionalNotes: "",
  });

  const [selectedStreams, setSelectedStreams] = useState<string[]>(["Engineering"]);

  const availableStreamsList = [
    { id: "Engineering", label: "Engineering (B.E / B.Tech)" },
    { id: "Arts & Science", label: "Arts & Science (B.A, B.Sc, BCA)" },
    { id: "Medical", label: "Medical & Healthcare (MBBS, BDS)" },
    { id: "Management", label: "Management (MBA, BBA)" },
    { id: "Commerce", label: "Commerce (B.Com, M.Com)" },
    { id: "Law", label: "Law (LL.B, BA LL.B)" },
    { id: "Polytechnic", label: "Polytechnic & Diploma" },
    { id: "Pharmacy", label: "Pharmacy (B.Pharm, D.Pharm)" },
    { id: "Nursing", label: "Nursing & Paramedical" },
    { id: "Dental", label: "Dental Sciences" },
    { id: "Education", label: "Education & B.Ed" },
  ];

  const isAllSelected = selectedStreams.length === availableStreamsList.length;

  function handleSelectAllStreams() {
    if (isAllSelected) {
      setSelectedStreams(["Engineering"]);
    } else {
      setSelectedStreams(availableStreamsList.map((s) => s.id));
    }
  }

  function toggleStream(streamId: string) {
    setSelectedStreams((prev) => {
      if (prev.includes(streamId)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((s) => s !== streamId);
      } else {
        return [...prev, streamId];
      }
    });
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);

  // AI Website Verification & Dynamic Image State
  const [verifyingWebsite, setVerifyingWebsite] = useState(false);
  const [websiteVerified, setWebsiteVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [collegeImage, setCollegeImage] = useState<string>(
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);

    // Reset verification state if website input is cleared
    if (name === "website" && (!value || !value.trim())) {
      setWebsiteVerified(false);
      setVerificationMessage("");
      setCollegeImage(
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
      );
    }
  }

  // Trigger AI Verification on Website input blur or when valid URL typed
  async function handleVerifyWebsite(urlToVerify?: string) {
    const url = (urlToVerify || formData.website).trim();
    if (!url || url.length < 4) return;

    setVerifyingWebsite(true);
    setError(null);

    try {
      const res = await fetch("/api/college-registration/verify-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.isCollege) {
        setWebsiteVerified(true);
        setVerificationMessage(data.message || "Verified Authentic College Website");
        if (data.previewImage) {
          setCollegeImage(data.previewImage);
        }
        if (!formData.collegeName && data.suggestedName) {
          setFormData((prev) => ({ ...prev, collegeName: data.suggestedName }));
        }
      } else {
        setWebsiteVerified(false);
        setVerificationMessage("");
      }
    } catch (err) {
      setWebsiteVerified(false);
      setVerificationMessage("");
    } finally {
      setVerifyingWebsite(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        category: selectedStreams.join(", "),
      };

      const res = await fetch("/api/college-registration/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit registration request.");
      }

      setSubmittedRequest(data.request);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Header / Brand Nav */}
      <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="C2Talents Logo"
              className="h-14 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2e266f] hover:text-amber-600 bg-stone-100 hover:bg-stone-150 px-4 py-2 rounded-xl transition-all border border-stone-200"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Main Website
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Form Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Platform Value Props & Dynamic AI Image Card */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-900 text-xs font-extrabold mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Direct Self-Service College Onboarding
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#2e266f] tracking-tight leading-tight">
              Join the Premier <span className="text-amber-600">C2Talents</span> Platform
            </h1>
            <p className="mt-3 text-xs md:text-sm text-stone-600 leading-relaxed font-medium">
              Showcase your institution to thousands of aspiring students across the nation. Register your college today to receive secure self-service profile management and verified platform publishing.
            </p>
          </div>

          {/* Dynamic AI College Hero Image Card */}
          <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-xl group bg-stone-900">
            <img
              src={collegeImage}
              alt="College Campus Preview"
              className="w-full h-60 object-cover group-hover:scale-105 transition-all duration-700 opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#160b33]/90 via-[#2e266f]/40 to-transparent flex items-end p-5 text-white">
              <div className="space-y-1">
                {websiteVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-wider shadow-sm animate-in fade-in">
                    <Check className="w-3 h-3 stroke-[3]" /> Verified Web Preview
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Verified Institution Network
                  </span>
                )}

                <h3 className="text-base font-black truncate max-w-sm">
                  {formData.collegeName || "Empowering 5,000+ Higher Education Institutions"}
                </h3>
                <p className="text-[11px] text-purple-100/90 font-medium">
                  {websiteVerified
                    ? `AI Verified College Website (${formData.website})`
                    : "Direct lead connection with 100,000+ verified student applicants."}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#2e266f]">Secure Access & Profile Ownership</h3>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-normal">
                  Upon admin review, you will receive a unique, encrypted profile management link to maintain courses, fees, placements, and facilities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-purple-100 text-[#2e266f] shrink-0">
                <Zap className="w-5 h-5 text-[#2e266f]" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#2e266f]">Instant Verification & Live Publishing</h3>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-normal">
                  Submit your detailed information directly. Our verification panel reviews and publishes your college profile live on the C2Talents network.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <Users className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#2e266f]">Direct Student Leads & Enquiries</h3>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-normal">
                  Connect with verified high-intent students seeking admission in your courses, hostel programs, and specializations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form or Success Card */}
        <div className="lg:col-span-7">
          {submittedRequest ? (
            <div className="bg-white border border-emerald-300 rounded-3xl p-8 md:p-10 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900">Registration Request Submitted!</h2>
                <p className="text-xs md:text-sm text-stone-600 mt-2 max-w-md mx-auto font-medium">
                  Thank you for registering <span className="font-extrabold text-[#2e266f]">{submittedRequest.collegeName}</span> with C2Talents.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3 text-xs font-medium">
                <div className="flex justify-between border-b border-stone-200/70 pb-2">
                  <span className="text-stone-500 font-semibold">Contact Person:</span>
                  <span className="font-bold text-stone-900">{submittedRequest.contactPerson}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/70 pb-2">
                  <span className="text-stone-500 font-semibold">Registered Email:</span>
                  <span className="font-bold text-stone-900">{submittedRequest.email}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/70 pb-2">
                  <span className="text-stone-500 font-semibold">Mobile Number:</span>
                  <span className="font-bold text-stone-900">{submittedRequest.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-semibold">Status:</span>
                  <span className="font-extrabold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                    PENDING ADMIN APPROVAL
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-stone-700 leading-relaxed font-medium">
                <span className="font-extrabold text-[#2e266f] block mb-1">📋 Request Received & Under Admin Review</span>
                Your registration request for <strong>{submittedRequest.collegeName}</strong> has been submitted. Our admin verification panel will review your institution credentials and issue your official portal access link upon approval.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/colleges?search=${encodeURIComponent(submittedRequest.collegeName)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2e266f] hover:bg-[#3d338f] text-white text-xs font-extrabold transition-all shadow-md"
                >
                  <Building2 className="w-4 h-4 text-amber-400" /> View College in Directory
                </Link>

                <button
                  onClick={() => {
                    setSubmittedRequest(null);
                    setFormData({
                      collegeName: "",
                      contactPerson: "",
                      email: "",
                      mobile: "",
                      website: "",
                      location: "",
                      type: "Private",
                      feesPerYear: "Flexible / Varies by Course",
                      additionalNotes: "",
                    });
                    setSelectedStreams(["Engineering"]);
                    setWebsiteVerified(false);
                    setCollegeImage("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80");
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all border border-stone-300 cursor-pointer"
                >
                  Submit Another College
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 shadow-xl shadow-stone-200/50 relative">
              <div className="flex items-center justify-between pb-6 border-b border-stone-100 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2e266f] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-600" /> College Registration Form
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 font-medium">Fill out the details below to express interest in joining C2Talents.</p>
                </div>
                <Award className="w-8 h-8 text-amber-500/40 hidden sm:block" />
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* College Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    College Name <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="collegeName"
                      required
                      value={formData.collegeName}
                      onChange={handleChange}
                      placeholder="e.g. SRM Institute of Science and Technology"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Contact Person & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Contact Person <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="contactPerson"
                        required
                        value={formData.contactPerson}
                        onChange={handleChange}
                        placeholder="e.g. Dr. Rajesh Kumar (Admission Director)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Official Email Address <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admissions@college.edu.in"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile & Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Mobile Number <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        name="mobile"
                        required
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                        College Website
                      </label>
                      {websiteVerified && (
                        <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> Verified Authentic
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        onBlur={() => handleVerifyWebsite()}
                        placeholder="https://www.srmist.edu.in"
                        className={`w-full pl-10 pr-10 py-3 rounded-xl bg-stone-50 border text-xs text-stone-900 placeholder-stone-400 font-medium transition-all focus:bg-white focus:outline-none ${
                          websiteVerified
                            ? "border-emerald-500 focus:border-emerald-600 ring-1 ring-emerald-400/40"
                            : "border-stone-200 focus:border-[#2e266f]"
                        }`}
                      />

                      {/* Right Verification Indicator inside Input Box */}
                      <div className="absolute right-3 top-3 flex items-center">
                        {verifyingWebsite ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#2e266f]" />
                        ) : websiteVerified ? (
                          <div
                            className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs"
                            title="Verified Authentic Higher Education Institution Website"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {websiteVerified && (
                      <p className="text-[10px] text-emerald-700 font-extrabold mt-1 flex items-center gap-1">
                        ✓ {verificationMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Academic Streams Offered (Interactive Checklist Format) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Academic Streams Offered <span className="text-amber-600">*</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllStreams}
                        className={`text-[10.5px] font-extrabold px-3 py-1 rounded-full transition-all cursor-pointer border flex items-center gap-1.5 shadow-2xs ${
                          isAllSelected
                            ? "bg-amber-400 text-stone-950 border-amber-500 hover:bg-amber-300"
                            : "bg-purple-50 hover:bg-purple-100 text-[#2e266f] border-purple-200"
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{isAllSelected ? "Deselect All" : "Select All Streams"}</span>
                      </button>

                      <span className="text-[10px] text-[#2e266f] font-extrabold normal-case bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 hidden sm:inline-block">
                        Checklist
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
                    {availableStreamsList.map((stream) => {
                      const isChecked = selectedStreams.includes(stream.id);
                      return (
                        <label
                          key={stream.id}
                          onClick={() => toggleStream(stream.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border ${
                            isChecked
                              ? "bg-[#2e266f] text-white border-[#2e266f] shadow-xs"
                              : "bg-white text-stone-700 border-stone-200/90 hover:border-[#2e266f] hover:bg-purple-50/40"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                              isChecked
                                ? "bg-amber-400 border-amber-400 text-stone-950"
                                : "bg-stone-100 border-stone-300"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{stream.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Institution Type & Fee Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Institution Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 font-medium transition-all"
                    >
                      <option value="Private">Private Institution</option>
                      <option value="Government">Government Institution</option>
                      <option value="Govt-Aided">Government Aided</option>
                      <option value="Autonomous">Autonomous College</option>
                      <option value="Deemed">Deemed University</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Annual Fee Structure Range
                    </label>
                    <select
                      name="feesPerYear"
                      value={formData.feesPerYear}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 font-medium transition-all"
                    >
                      <option value="Flexible / Varies by Course">Flexible / Varies by Course</option>
                      <option value="50000">Under ₹50,000 / year</option>
                      <option value="100000">₹50,000 - ₹1,00,000 / year</option>
                      <option value="200000">₹1,00,000 - ₹2,00,000 / year</option>
                      <option value="400000">Above ₹2,00,000 / year</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Location (City & State) <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Kattankulathur, Chennai, Tamil Nadu"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Additional Notes / Message
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <textarea
                      name="additionalNotes"
                      rows={3}
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      placeholder="Enter any additional details about your programs, accreditation (NAAC/NIRF), or special requests..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#2e266f] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-[#2e266f] hover:bg-[#3d338f] text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Application Request...
                    </>
                  ) : (
                    <>
                      Submit College Registration Request <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-stone-500 font-medium leading-relaxed">
                  By submitting this form, you confirm that you are an authorized representative of the college.
                </p>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 font-medium">
        <p>© {new Date().getFullYear()} C2Talents SaaS College Onboarding Engine. All rights reserved.</p>
      </footer>
    </div>
  );
}
