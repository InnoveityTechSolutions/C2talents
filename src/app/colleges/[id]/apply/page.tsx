"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  BookOpen,
  UserCheck,
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Award,
  Lock,
  Phone,
  Mail,
  Home,
  Clock,
  FileCheck,
  X,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  duration?: string;
  feesPerYear?: number;
  eligibility?: string;
}

interface College {
  id: string;
  name: string;
}

export default function CollegeApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const collegeIdOrSlug = resolvedParams.id;
  const router = useRouter();

  // Auth & Initialization State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // College & Courses
  const [college, setCollege] = useState<College | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  // Step Tracker (1 to 8)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [programme, setProgramme] = useState<"UG" | "PG">("UG");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Personal Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [pincode, setPincode] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [community, setCommunity] = useState("OC");
  const [religion, setReligion] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  // Academic Details - 10th
  const [board10th, setBoard10th] = useState("State Board");
  const [school10th, setSchool10th] = useState("");
  const [percentage10th, setPercentage10th] = useState("");
  const [year10th, setYear10th] = useState("2022");

  // Academic Details - 12th
  const [board12th, setBoard12th] = useState("State Board");
  const [school12th, setSchool12th] = useState("");
  const [percentage12th, setPercentage12th] = useState("");
  const [group12th, setGroup12th] = useState("Bio-Maths");
  const [year12th, setYear12th] = useState("2024");

  // Academic Details - UG (Only PG)
  const [ugCollege, setUgCollege] = useState("");
  const [ugUniversity, setUgUniversity] = useState("");
  const [ugDegree, setUgDegree] = useState("B.E / B.Tech");
  const [ugSpecialization, setUgSpecialization] = useState("");
  const [ugPercentage, setUgPercentage] = useState("");
  const [ugYear, setUgYear] = useState("2026");
  const [currentArrears, setCurrentArrears] = useState("0");
  const [historyArrears, setHistoryArrears] = useState("0");

  // Uploaded Documents (File Data URLs or Names)
  const [marksheet10thUrl, setMarksheet10thUrl] = useState("");
  const [marksheet12thUrl, setMarksheet12thUrl] = useState("");
  const [marksheetUgUrl, setMarksheetUgUrl] = useState("");
  const [tcUrl, setTcUrl] = useState("");
  const [communityCertUrl, setCommunityCertUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [aadharUrl, setAadharUrl] = useState("");

  // Additional Details
  const [hostelRequired, setHostelRequired] = useState(false);
  const [transportRequired, setTransportRequired] = useState(false);
  const [scholarshipRequired, setScholarshipRequired] = useState(false);
  const [firstGraduate, setFirstGraduate] = useState(false);
  const [sportsQuota, setSportsQuota] = useState(false);
  const [ncc, setNcc] = useState(false);
  const [nss, setNss] = useState(false);
  const [achievements, setAchievements] = useState("");
  const [extraCurricular, setExtraCurricular] = useState("");
  const [statementOfPurpose, setStatementOfPurpose] = useState("");

  // Submission UI & Validation State
  const [submitting, setSubmitting] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Validate Mandatory Fields per Step
  function handleNextStep(targetStep: number) {
    setStepError(null);

    // Validation for Step 1 -> 2
    if (currentStep === 1) {
      if (!college?.id) {
        setStepError("College information is missing. Please wait for college details to load.");
        return;
      }
      if (!programme) {
        setStepError("Please select a programme (Undergraduate or Postgraduate).");
        return;
      }
    }

    // Validation for Step 2 -> 3
    if (currentStep === 2) {
      if (courses.length > 0 && !selectedCourseId) {
        setStepError("Please select an available course to continue.");
        return;
      }
    }

    // Validation for Step 3 -> 4
    if (currentStep === 3) {
      if (!firstName.trim()) {
        setStepError("First Name is a mandatory field.");
        return;
      }
      if (!gender) {
        setStepError("Gender is a mandatory field.");
        return;
      }
      if (!dob) {
        setStepError("Date of Birth is a mandatory field.");
        return;
      }
      if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
        setStepError("Please enter a valid 10-digit Mobile Number.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setStepError("Please enter a valid Email Address.");
        return;
      }
    }

    // Validation for Step 4 -> 5
    if (currentStep === 4) {
      if (!percentage10th || Number(percentage10th) <= 0 || Number(percentage10th) > 100) {
        setStepError("Please enter a valid 10th Standard Percentage.");
        return;
      }
      if (!percentage12th || Number(percentage12th) <= 0 || Number(percentage12th) > 100) {
        setStepError("Please enter a valid 12th Standard Percentage.");
        return;
      }
      if (programme === "PG" && (!ugPercentage || Number(ugPercentage) <= 0)) {
        setStepError("Please enter your UG Percentage / CGPA for Postgraduate admission.");
        return;
      }
    }

    // Validation for Step 5 -> 6
    if (currentStep === 5) {
      if (!marksheet10thUrl) {
        setStepError("10th Marksheet upload is mandatory.");
        return;
      }
      if (!marksheet12thUrl) {
        setStepError("12th Marksheet upload is mandatory.");
        return;
      }
      if (programme === "PG" && !marksheetUgUrl) {
        setStepError("UG Consolidated Marksheet upload is mandatory for PG applicants.");
        return;
      }
    }

    setCurrentStep(targetStep);
  }

  // Initialize Page & Fetch Data
  useEffect(() => {
    async function init() {
      try {
        // Fetch User Session
        const authRes = await fetch("/api/admin/auth/me");
        const authData = await authRes.json();
        if (authData.user) {
          setUser(authData.user);
          if (authData.user.email) setEmail(authData.user.email);
          if (authData.user.name) {
            const parts = authData.user.name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
        }

        // Fetch College & Courses
        const courseRes = await fetch(`/api/colleges/${collegeIdOrSlug}/courses`);
        const courseData = await courseRes.json();

        if (courseData.success) {
          setCollege(courseData.college);
          setCourses(courseData.courses || []);
          if (courseData.courses && courseData.courses.length > 0) {
            setSelectedCourseId(courseData.courses[0].id);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [collegeIdOrSlug]);

  // Handle File Upload to DataURL
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds maximum limit of 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Submit Application
  async function handleSubmitApplication() {
    setSubmitting(true);

    try {
      const res = await fetch("/api/admissions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id || null,
          collegeId: college?.id,
          courseId: selectedCourseId,
          programme,
          firstName,
          lastName,
          gender,
          dob,
          fatherName,
          motherName,
          mobileNumber,
          alternateNumber,
          email,
          address,
          city,
          district,
          state,
          pincode,
          nationality,
          community,
          religion,
          bloodGroup,

          board10th,
          school10th,
          percentage10th,
          year10th,

          board12th,
          school12th,
          percentage12th,
          group12th,
          year12th,

          ugCollege,
          ugUniversity,
          ugDegree,
          ugSpecialization,
          ugPercentage,
          ugYear,
          currentArrears,
          historyArrears,

          marksheet10thUrl,
          marksheet12thUrl,
          marksheetUgUrl,
          tcUrl,
          communityCertUrl,
          photoUrl,
          aadharUrl,

          hostelRequired,
          transportRequired,
          scholarshipRequired,
          firstGraduate,
          sportsQuota,
          ncc,
          nss,
          achievements,
          extraCurricular,
          statementOfPurpose,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedApplicationId(data.applicationId);
        setShowSuccessModal(true);
      } else {
        alert(data.error || "Failed to submit application.");
      }
    } catch (err: any) {
      alert("Error submitting application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c0b36] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-sm font-extrabold text-purple-200">Preparing Official Admission Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col font-sans text-slate-900">
      {/* HEADER BAR */}
      <header className="bg-[#1c0b36] text-white border-b border-purple-900/60 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="C2Talents Logo"
              className="h-8 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all"
            />
            <span className="text-[10.5px] text-amber-300 font-black uppercase tracking-wider block border-l border-purple-700/60 pl-3">
              OFFICIAL ADMISSION PORTAL 2026
            </span>
          </Link>
        </div>
      </header>

      {/* WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* STEPPER PROGRESS INDICATOR WITH COLLEGE NAME */}
        <div className="bg-[#1c0b36] p-6 rounded-3xl border border-purple-900/60 shadow-lg text-white space-y-4">
          {/* Prominent Target College Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-purple-900/60 border border-purple-700/60 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10.5px] font-black text-amber-300 uppercase tracking-widest block">
                  Applying Target Institution
                </span>
                <h3 className="text-sm sm:text-base font-black text-white">
                  {college?.name || "Loading Institution..."}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-black">
              Direct Admission Desk
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
            <div>
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
                Step {currentStep} of 8
              </span>
              <h2 className="text-base font-black text-white">
                {currentStep === 1 && "Selected Institution & Programme"}
                {currentStep === 2 && "Course Selection"}
                {currentStep === 3 && "Personal & Contact Information"}
                {currentStep === 4 && "Academic Credentials (UG / PG)"}
                {currentStep === 5 && "Document Uploads"}
                {currentStep === 6 && "Additional Student Preferences"}
                {currentStep === 7 && "Verification & Final Review"}
                {currentStep === 8 && "Application Confirmation"}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-purple-200">
                {Math.round((currentStep / 7) * 100)}% Completed
              </span>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === currentStep
                    ? "bg-amber-400 shadow-md shadow-amber-400/50"
                    : s < currentStep
                    ? "bg-emerald-400"
                    : "bg-purple-950 border border-purple-900"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* STEP CONTENT CARDS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-sm space-y-6">
          {/* MANDATORY FIELD VALIDATION ERROR ALERT BANNER */}
          {stepError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-black flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <X className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{stepError}</span>
              </div>
              <button
                type="button"
                onClick={() => setStepError(null)}
                className="text-rose-500 hover:text-rose-900 font-extrabold text-xs px-2 py-1 bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
          {/* STEP 1: SELECTED COLLEGE (Read Only) */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <Building2 className="w-7 h-7 text-[#1c0b36] shrink-0" />
                <div>
                  <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">
                    Selected Institution (Read-Only)
                  </span>
                  <h3 className="text-lg font-black text-[#1c0b36]">{college?.name || "Target College"}</h3>
                </div>
              </div>

              {/* Programme Choice (UG vs PG) */}
              <div>
                <label className="text-xs font-extrabold text-[#1c0b36] block mb-2">
                  Which programme are you applying for? *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setProgramme("UG")}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      programme === "UG"
                        ? "bg-[#1c0b36] text-amber-300 border-amber-400 shadow-md font-black"
                        : "bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200 font-bold"
                    }`}
                  >
                    <span className="text-base block">Undergraduate (UG)</span>
                    <span className="text-[11px] opacity-80 font-medium">B.E, B.Tech, B.Sc, B.Com, B.A, BBA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgramme("PG")}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      programme === "PG"
                        ? "bg-[#1c0b36] text-amber-300 border-amber-400 shadow-md font-black"
                        : "bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200 font-bold"
                    }`}
                  >
                    <span className="text-base block">Postgraduate (PG)</span>
                    <span className="text-[11px] opacity-80 font-medium">M.E, M.Tech, MBA, MCA, M.Sc, M.Com</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleNextStep(2)}
                  className="px-6 py-3 rounded-2xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Course Selection</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COURSE SELECTION */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">
                  Select Available Course in {college?.name} *
                </label>
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  Showing ONLY degree courses offered by {college?.name}.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.length > 0 ? (
                    courses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCourseId(c.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedCourseId === c.id
                            ? "bg-[#1c0b36] text-white border-amber-400 shadow-md border-l-4 border-l-amber-400"
                            : "bg-slate-50 hover:bg-purple-50 text-slate-800 border-purple-100"
                        }`}
                      >
                        <p className={`text-xs font-extrabold ${selectedCourseId === c.id ? "text-amber-300" : "text-[#1c0b36]"}`}>
                          {c.title}
                        </p>
                        {c.duration && (
                          <p className={`text-[11px] mt-1 ${selectedCourseId === c.id ? "text-purple-200" : "text-slate-500 font-medium"}`}>
                            Duration: {c.duration} {c.feesPerYear ? `• Fees: ₹${c.feesPerYear.toLocaleString()}/yr` : ""}
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900">
                      General Degree Admission Course (Default Option)
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => handleNextStep(3)}
                  className="px-6 py-3 rounded-2xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Personal Details</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PERSONAL DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-[#1c0b36] border-b border-purple-100 pb-2">
                Personal & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Father&apos;s Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Mother&apos;s Name</label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Door No, Street Name, Area"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Community</label>
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold"
                  >
                    <option value="OC">OC (Open Competition)</option>
                    <option value="BC">BC (Backward Class)</option>
                    <option value="MBC">MBC / DNC</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => handleNextStep(4)}
                  className="px-6 py-3 rounded-2xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Academic Details</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ACADEMIC DETAILS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-[#1c0b36] border-b border-purple-100 pb-2">
                Educational History ({programme} Candidate)
              </h3>

              {/* 10th Standard Details */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-purple-100">
                <span className="text-xs font-black text-[#1c0b36] block">10th Standard Credentials</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Board</label>
                    <input
                      type="text"
                      value={board10th}
                      onChange={(e) => setBoard10th(e.target.value)}
                      placeholder="State Board / CBSE"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">School Name</label>
                    <input
                      type="text"
                      value={school10th}
                      onChange={(e) => setSchool10th(e.target.value)}
                      placeholder="School name"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Percentage %</label>
                    <input
                      type="number"
                      value={percentage10th}
                      onChange={(e) => setPercentage10th(e.target.value)}
                      placeholder="88.5"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Passing Year</label>
                    <input
                      type="text"
                      value={year10th}
                      onChange={(e) => setYear10th(e.target.value)}
                      placeholder="2022"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 12th Standard Details */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-purple-100">
                <span className="text-xs font-black text-[#1c0b36] block">12th Standard Credentials</span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Board</label>
                    <input
                      type="text"
                      value={board12th}
                      onChange={(e) => setBoard12th(e.target.value)}
                      placeholder="State Board / CBSE"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">School Name</label>
                    <input
                      type="text"
                      value={school12th}
                      onChange={(e) => setSchool12th(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Subject Group</label>
                    <input
                      type="text"
                      value={group12th}
                      onChange={(e) => setGroup12th(e.target.value)}
                      placeholder="Bio-Maths / CS"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Percentage %</label>
                    <input
                      type="number"
                      value={percentage12th}
                      onChange={(e) => setPercentage12th(e.target.value)}
                      placeholder="91.2"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Passing Year</label>
                    <input
                      type="text"
                      value={year12th}
                      onChange={(e) => setYear12th(e.target.value)}
                      placeholder="2024"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* UG Details (If PG candidate) */}
              {programme === "PG" && (
                <div className="space-y-3 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <span className="text-xs font-black text-[#1c0b36] block">Undergraduate (UG) Degree History</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">UG College</label>
                      <input
                        type="text"
                        value={ugCollege}
                        onChange={(e) => setUgCollege(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">UG University</label>
                      <input
                        type="text"
                        value={ugUniversity}
                        onChange={(e) => setUgUniversity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">UG Degree</label>
                      <input
                        type="text"
                        value={ugDegree}
                        onChange={(e) => setUgDegree(e.target.value)}
                        placeholder="B.E CSE"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Percentage / CGPA</label>
                      <input
                        type="number"
                        value={ugPercentage}
                        onChange={(e) => setUgPercentage(e.target.value)}
                        placeholder="8.4"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => handleNextStep(5)}
                  className="px-6 py-3 rounded-2xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Document Uploads</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENT UPLOAD */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-[#1c0b36] border-b border-purple-100 pb-2">
                Document Uploads (PDF, JPG, PNG up to 10MB)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-2">
                  <label className="text-xs font-extrabold text-[#1c0b36] block">10th Marksheet *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload(e, setMarksheet10thUrl)}
                    className="text-xs text-slate-600"
                  />
                  {marksheet10thUrl && <span className="text-[10px] text-emerald-600 font-bold block">✓ File Attached</span>}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-2">
                  <label className="text-xs font-extrabold text-[#1c0b36] block">12th Marksheet *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload(e, setMarksheet12thUrl)}
                    className="text-xs text-slate-600"
                  />
                  {marksheet12thUrl && <span className="text-[10px] text-emerald-600 font-bold block">✓ File Attached</span>}
                </div>

                {programme === "PG" && (
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                    <label className="text-xs font-extrabold text-[#1c0b36] block">UG Degree Consolidated Marksheet *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => handleFileUpload(e, setMarksheetUgUrl)}
                      className="text-xs text-slate-600"
                    />
                    {marksheetUgUrl && <span className="text-[10px] text-emerald-600 font-bold block">✓ File Attached</span>}
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-2">
                  <label className="text-xs font-extrabold text-[#1c0b36] block">Transfer Certificate (TC)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload(e, setTcUrl)}
                    className="text-xs text-slate-600"
                  />
                  {tcUrl && <span className="text-[10px] text-emerald-600 font-bold block">✓ File Attached</span>}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-2">
                  <label className="text-xs font-extrabold text-[#1c0b36] block">Community Certificate</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload(e, setCommunityCertUrl)}
                    className="text-xs text-slate-600"
                  />
                  {communityCertUrl && <span className="text-[10px] text-emerald-600 font-bold block">✓ File Attached</span>}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-2">
                  <label className="text-xs font-extrabold text-[#1c0b36] block">Passport Size Photo</label>
                  <input
                    type="file"
                    accept=".jpg,.png"
                    onChange={(e) => handleFileUpload(e, setPhotoUrl)}
                    className="text-xs text-slate-600"
                  />
                  {photoUrl && <span className="text-[10px] text-emerald-600 font-bold block">✓ File Attached</span>}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => handleNextStep(6)}
                  className="px-6 py-3 rounded-2xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Additional Details</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: ADDITIONAL DETAILS */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#1c0b36] border-b border-purple-100 pb-2">
                Additional Student Preferences & Quota
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100 flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={hostelRequired}
                    onChange={(e) => setHostelRequired(e.target.checked)}
                    className="rounded accent-[#1c0b36]"
                  />
                  <span>Hostel Accommodation</span>
                </label>

                <label className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100 flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={transportRequired}
                    onChange={(e) => setTransportRequired(e.target.checked)}
                    className="rounded accent-[#1c0b36]"
                  />
                  <span>Bus Transport</span>
                </label>

                <label className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100 flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={scholarshipRequired}
                    onChange={(e) => setScholarshipRequired(e.target.checked)}
                    className="rounded accent-[#1c0b36]"
                  />
                  <span>Scholarship Assistance</span>
                </label>

                <label className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100 flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={firstGraduate}
                    onChange={(e) => setFirstGraduate(e.target.checked)}
                    className="rounded accent-[#1c0b36]"
                  />
                  <span>First Graduate Quota</span>
                </label>

                <label className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100 flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={sportsQuota}
                    onChange={(e) => setSportsQuota(e.target.checked)}
                    className="rounded accent-[#1c0b36]"
                  />
                  <span>Sports Quota</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Statement of Purpose (SOP) / Notes</label>
                <textarea
                  rows={3}
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                  placeholder="Brief statement about your academic goals..."
                  className="w-full p-3 bg-slate-50 border border-purple-100 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => handleNextStep(7)}
                  className="px-6 py-3 rounded-2xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Final Application</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: FINAL REVIEW & VERIFICATION */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider block">
                    Verify Details Before Submission
                  </span>
                  <h3 className="text-sm font-black text-[#1c0b36]">Application Summary</h3>
                </div>
                <span className="px-3 py-1 bg-amber-400 text-stone-950 font-black text-xs rounded-full">
                  {programme} Candidate
                </span>
              </div>

              {/* Summary Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-1">
                  <span className="font-extrabold text-[#1c0b36] block border-b pb-1">College & Course</span>
                  <p><strong>Institution:</strong> {college?.name}</p>
                  <p><strong>Selected Course:</strong> {courses.find((c) => c.id === selectedCourseId)?.title || "General Course"}</p>
                  <p><strong>Programme:</strong> {programme}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-1">
                  <span className="font-extrabold text-[#1c0b36] block border-b pb-1">Personal Details</span>
                  <p><strong>Name:</strong> {firstName} {lastName}</p>
                  <p><strong>Mobile:</strong> {mobileNumber}</p>
                  <p><strong>Email:</strong> {email}</p>
                  <p><strong>Gender / DOB:</strong> {gender} ({dob})</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-1 sm:col-span-2">
                  <span className="font-extrabold text-[#1c0b36] block border-b pb-1">Academic Scores</span>
                  <p><strong>10th Standard:</strong> {percentage10th}% ({school10th}, {board10th} - {year10th})</p>
                  <p><strong>12th Standard:</strong> {percentage12th}% ({school12th}, {group12th} - {year12th})</p>
                  {programme === "PG" && (
                    <p><strong>UG Degree:</strong> {ugDegree} - {ugPercentage}% ({ugCollege})</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> : <FileCheck className="w-4.5 h-4.5 text-stone-950" />}
                  <span>{submitting ? "Submitting Application..." : "Submit Official Application"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#1c0b36]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-purple-200 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Application ID: {submittedApplicationId}
              </span>
              <h2 className="text-xl font-black text-[#1c0b36] mt-2">Application Submitted Successfully</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Thank you for submitting your admission application for <strong>{college?.name}</strong>. Your application has been successfully received by C2Talents.
              Our admissions team will review your documents and details. After verification, our team will contact you using your registered mobile number or email.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard/applications"
                className="flex-1 py-3 bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs rounded-2xl text-center shadow-md"
              >
                Go to Student Dashboard
              </Link>
              <Link
                href={`/dashboard/applications?id=${submittedApplicationId}`}
                className="flex-1 py-3 bg-purple-100 hover:bg-purple-200 text-purple-950 font-extrabold text-xs rounded-2xl text-center border border-purple-200"
              >
                View Application Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
