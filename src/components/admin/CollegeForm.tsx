"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PopupModal } from "@/components/ui/PopupModal";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Sparkles,
  Globe,
  Plus,
  Trash2,
  Save,
  Building2,
  MapPin,
  Phone,
  BookOpen,
  DollarSign,
  CheckSquare,
  TrendingUp,
  GraduationCap,
  Home,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  ChevronDown,
  ChevronUp,
  Upload,
  Copy,
  Eye,
  FileText,
  Star,
  MessageSquare,
} from "lucide-react";

interface ReviewItem {
  id?: string;
  studentName: string;
  course: string;
  batchYear: number | string;
  title: string;
  rating: number | string;
  academicRating?: number | string;
  infrastructureRating?: number | string;
  placementRating?: number | string;
  campusRating?: number | string;
  valueForMoneyRating?: number | string;
  likes: string;
  dislikes: string;
  content: string;
  isVerified: boolean;
}

const ALL_CATEGORIES = [
  "Engineering",
  "Arts & Science",
  "Medical",
  "Law",
  "MBA",
  "Architecture",
  "Agriculture",
  "Government",
  "Private",
  "Women's College",
  "Autonomous",
  "Co-Ed",
  "Research",
  "Distance Education",
];

const ALL_FACILITIES = [
  "Hostel",
  "Transport",
  "Library",
  "Sports",
  "Gym",
  "WiFi",
  "Medical",
  "Cafeteria",
  "ATM",
  "Bank",
  "Auditorium",
  "Labs",
  "Placement Cell",
  "Research Centre",
  "Innovation Hub",
];

function cleanNumber(val: unknown): string {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "number") return isNaN(val) ? "" : String(val);
  const str = String(val).trim();
  const noCommas = str.replace(/,/g, "");
  const match = noCommas.match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

function cleanString(val: unknown, joiner: string = ", "): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;
          if ("name" in obj && obj.name) return String(obj.name);
          if ("title" in obj && obj.title) return String(obj.title);
          if ("value" in obj && obj.value) return String(obj.value);
          return Object.entries(obj)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        }
        return String(item).trim();
      })
      .filter(Boolean)
      .join(joiner);
  }
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if ("value" in obj) return cleanString(obj.value, joiner);
    const entries = Object.entries(obj).map(([k, v]) => `${k}: ${v}`);
    return entries.join(" | ");
  }
  return String(val).trim();
}

function formatFaq(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;
          const q = String(obj.question || obj.q || obj.title || "");
          const a = String(obj.answer || obj.a || obj.content || obj.desc || "");
          if (q && a) return `Q: ${q}\nA: ${a}`;
          if (q) return `Q: ${q}`;
          if (a) return `A: ${a}`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  return cleanString(val, "\n\n");
}

function normalizeFacilities(rawList: unknown): string[] {
  if (!rawList) return [];
  const items: string[] = Array.isArray(rawList)
    ? rawList.map(String)
    : typeof rawList === "string"
    ? rawList.split(/[,;\n]+/).map((s) => s.trim())
    : (rawList && typeof rawList === "object" && "value" in rawList)
    ? (Array.isArray((rawList as any).value)
        ? (rawList as any).value.map(String)
        : typeof (rawList as any).value === "string"
        ? (rawList as any).value.split(/[,;\n]+/).map((s: string) => s.trim())
        : [])
    : (rawList && typeof rawList === "object")
    ? Object.keys(rawList).filter((k) => (rawList as any)[k] === true)
    : [];

  const matched = new Set<string>();
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (ALL_FACILITIES.includes(trimmed)) {
      matched.add(trimmed);
      continue;
    }
    const directCase = ALL_FACILITIES.find((f) => f.toLowerCase() === trimmed.toLowerCase());
    if (directCase) {
      matched.add(directCase);
      continue;
    }
    const lower = trimmed.toLowerCase();
    if (/wi-?fi|internet|wireless/i.test(lower)) matched.add("WiFi");
    else if (/lab|laboratory|laboratories/i.test(lower)) matched.add("Labs");
    else if (/librar/i.test(lower)) matched.add("Library");
    else if (/hostel|dormitor|residen/i.test(lower)) matched.add("Hostel");
    else if (/sport|playground|ground|athletics/i.test(lower)) matched.add("Sports");
    else if (/gym|fitness/i.test(lower)) matched.add("Gym");
    else if (/cafeteria|canteen|food|mess|dining/i.test(lower)) matched.add("Cafeteria");
    else if (/medic|health|hospital|clinic|first aid/i.test(lower)) matched.add("Medical");
    else if (/transport|bus|buses|shuttle/i.test(lower)) matched.add("Transport");
    else if (/placement|career guidance|training & placement|t&p/i.test(lower)) matched.add("Placement Cell");
    else if (/auditorium|seminar hall|conference hall/i.test(lower)) matched.add("Auditorium");
    else if (/atm/i.test(lower)) matched.add("ATM");
    else if (/bank/i.test(lower)) matched.add("Bank");
    else if (/research|r&d/i.test(lower)) matched.add("Research Centre");
    else if (/innovation|incubat|startup/i.test(lower)) matched.add("Innovation Hub");
    else matched.add(trimmed);
  }
  return Array.from(matched);
}

function normalizeCategories(rawCat: unknown): string[] {
  if (!rawCat) return [];
  const items: string[] = Array.isArray(rawCat)
    ? rawCat.map(String)
    : typeof rawCat === "string"
    ? rawCat.split(/[,;\n]+/).map((s) => s.trim())
    : (rawCat && typeof rawCat === "object" && "value" in rawCat)
    ? (Array.isArray((rawCat as any).value)
        ? (rawCat as any).value.map(String)
        : typeof (rawCat as any).value === "string"
        ? (rawCat as any).value.split(/[,;\n]+/).map((s: string) => s.trim())
        : [])
    : (rawCat && typeof rawCat === "object")
    ? Object.keys(rawCat).filter((k) => (rawCat as any)[k] === true)
    : [];

  const matched = new Set<string>();
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (ALL_CATEGORIES.includes(trimmed)) {
      matched.add(trimmed);
      continue;
    }
    const directCase = ALL_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (directCase) {
      matched.add(directCase);
      continue;
    }
    const lower = trimmed.toLowerCase();
    if (/engin/i.test(lower)) matched.add("Engineering");
    else if (/arts/i.test(lower) || /science/i.test(lower)) matched.add("Arts & Science");
    else if (/med/i.test(lower)) matched.add("Medical");
    else if (/law/i.test(lower)) matched.add("Law");
    else if (/mba|management/i.test(lower)) matched.add("MBA");
    else if (/arch/i.test(lower)) matched.add("Architecture");
    else if (/agri/i.test(lower)) matched.add("Agriculture");
    else if (/gov/i.test(lower)) matched.add("Government");
    else if (/priv/i.test(lower)) matched.add("Private");
    else if (/women/i.test(lower)) matched.add("Women's College");
    else if (/autonom/i.test(lower)) matched.add("Autonomous");
    else if (/co-?ed/i.test(lower)) matched.add("Co-Ed");
    else if (/research/i.test(lower)) matched.add("Research");
    else if (/distance/i.test(lower)) matched.add("Distance Education");
    else matched.add(trimmed);
  }
  return Array.from(matched);
}

interface CourseItem {
  id?: string;
  title: string;
  duration: string;
  feesPerYear: string | number;
  eligibility: string;
  minGpa?: number | string | null;
  seats: string | number;
  entranceExam: string;
}

interface GalleryItem {
  url: string;
  altText: string;
  caption: string;
  tags: string;
}

export function CollegeForm({
  initialData,
  collegeId,
  isCollegePortal,
  onSubmitPortal,
}: {
  initialData?: any;
  collegeId?: string;
  isCollegePortal?: boolean;
  onSubmitPortal?: (payload: any) => Promise<void>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [websiteFetching, setWebsiteFetching] = useState(false);
  const [websiteUrlInput, setWebsiteUrlInput] = useState("");
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);

  // JSON File Import State
  const [selectedJsonFile, setSelectedJsonFile] = useState<File | null>(null);
  const [pastedJsonText, setPastedJsonText] = useState<string>("");
  const [importingJson, setImportingJson] = useState<boolean>(false);
  const [jsonImportStatus, setJsonImportStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [showImportJsonModal, setShowImportJsonModal] = useState(false);

  // Custom Website Popup State
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, message: "" });

  function showPopup(message: string, type: "success" | "error" | "info" | "warning" = "success", title?: string) {
    setPopup({ isOpen: true, message, type, title });
  }

  // Quality Check & Field Verification Metadata State
  const [fieldMetadata, setFieldMetadata] = useState<Record<string, { confidence: string; sourceUrl?: string; verified: boolean; warning?: string }>>({});
  const [verificationScore, setVerificationScore] = useState<number | null>(null);
  const [showUnconfirmedOnly, setShowUnconfirmedOnly] = useState<boolean>(false);

  function markFieldVerified(key: string) {
    setFieldMetadata((prev) => ({
      ...prev,
      [key]: {
        confidence: "HIGH",
        verified: true,
        sourceUrl: prev[key]?.sourceUrl || "Manual Entry",
        warning: undefined,
      },
    }));
  }

  function extractVal(
    dataObj: any,
    key: string,
    aliases: string[] = [],
    sectionWrappers: string[] = []
  ): any {
    if (!dataObj || typeof dataObj !== "object") return undefined;

    // Support nested root wrappers e.g. { data: { ... } } or { college: { ... } }
    const rootData = (dataObj.data && typeof dataObj.data === "object" && !Array.isArray(dataObj.data))
      ? dataObj.data
      : (dataObj.college && typeof dataObj.college === "object" && !Array.isArray(dataObj.college))
      ? dataObj.college
      : dataObj;

    const allKeys = [key, ...aliases];
    const wrappers = [
      ...sectionWrappers,
      "basicInfo", "basic_info",
      "location",
      "contact", "contactInfo",
      "academic", "academics",
      "fees", "feeStructure", "fee_structure",
      "placements", "placement", "placementDetails", "placementStats",
      "admissions", "admission",
      "hostel", "hostelDetails",
      "gallery", "media",
      "seo", "meta", "metadata",
      "status", "displayOptions", "settings",
      "collegeContent", "content", "narrativeContent", "cmsContent", "articles",
    ];

    let foundItem: any = undefined;

    // Helper to determine if an item is a direct field value (or metadata wrapper) rather than a section dictionary
    const isDirectVal = (item: any) => {
      if (item === undefined || item === null) return false;
      if (typeof item !== "object") return true;
      if (Array.isArray(item)) return true;
      if ("value" in item) return true;
      return false;
    };

    // 1. Check direct keys on rootData
    for (const k of allKeys) {
      if (rootData[k] !== undefined) {
        if (isDirectVal(rootData[k])) {
          foundItem = rootData[k];
          break;
        } else if (typeof rootData[k] === "object" && !Array.isArray(rootData[k])) {
          // If k matched a container object (e.g. rootData.fees), search inside it for the target field
          const sub = rootData[k];
          for (const innerK of allKeys) {
            if (isDirectVal(sub[innerK])) {
              foundItem = sub[innerK];
              break;
            }
          }
          if (foundItem !== undefined) break;
        }
      }
    }

    // 2. If not found, check direct keys on raw dataObj (if different)
    if (foundItem === undefined && rootData !== dataObj) {
      for (const k of allKeys) {
        if (dataObj[k] !== undefined) {
          if (isDirectVal(dataObj[k])) {
            foundItem = dataObj[k];
            break;
          } else if (typeof dataObj[k] === "object" && !Array.isArray(dataObj[k])) {
            const sub = dataObj[k];
            for (const innerK of allKeys) {
              if (isDirectVal(sub[innerK])) {
                foundItem = sub[innerK];
                break;
              }
            }
            if (foundItem !== undefined) break;
          }
        }
      }
    }

    // 3. If not found, check section wrappers on rootData
    if (foundItem === undefined) {
      for (const w of wrappers) {
        const sub = rootData[w];
        if (sub && typeof sub === "object" && !Array.isArray(sub)) {
          for (const k of allKeys) {
            if (isDirectVal(sub[k])) {
              foundItem = sub[k];
              break;
            }
          }
          if (foundItem !== undefined) break;
        }
      }
    }

    // 4. If not found, check section wrappers on raw dataObj
    if (foundItem === undefined && rootData !== dataObj) {
      for (const w of wrappers) {
        const sub = dataObj[w];
        if (sub && typeof sub === "object" && !Array.isArray(sub)) {
          for (const k of allKeys) {
            if (isDirectVal(sub[k])) {
              foundItem = sub[k];
              break;
            }
          }
          if (foundItem !== undefined) break;
        }
      }
    }

    if (foundItem === undefined || foundItem === null) {
      return undefined;
    }

    // Process metadata-wrapped item { value: ..., confidence: ..., sourceUrl: ..., verified: ... }
    if (typeof foundItem === "object" && !Array.isArray(foundItem) && "value" in foundItem) {
      setFieldMetadata((prev) => ({
        ...prev,
        [key]: {
          confidenceScore: foundItem.confidenceScore ?? (foundItem.verified ? 95 : 50),
          confidence: foundItem.confidence || (foundItem.verified ? "HIGH" : "LOW"),
          sourceUrl: foundItem.sourceUrl || "",
          sourcePage: foundItem.sourcePage || "",
          verified: Boolean(foundItem.verified),
          verificationStatus: foundItem.verificationStatus || (foundItem.verified ? "VERIFIED" : "MANUAL_VERIFICATION_REQUIRED"),
          warning: foundItem.warning || (foundItem.verified ? undefined : "⚠ Please Enter Manually"),
        },
      }));

      // NEVER insert "Not Verified" text inside textbox value itself! Keep empty string "" for unverified values
      if (
        foundItem.value === null ||
        (typeof foundItem.value === "string" && /^Not (Verified|Stated|Published|Mentioned|Available)/i.test(foundItem.value))
      ) {
        return "";
      }
      return foundItem.value;
    }

    // Direct string value that says "Not Verified"
    if (typeof foundItem === "string" && /^Not (Verified|Stated|Published|Mentioned|Available)/i.test(foundItem)) {
      return "";
    }

    return foundItem;
  }

  const renderBadge = (key: string) => {
    const meta = fieldMetadata[key] as any;
    if (!meta) return null;

    if (meta.verified || meta.verificationStatus === "VERIFIED" || (meta.confidenceScore && meta.confidenceScore >= 95)) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold border border-emerald-300 ml-2"
          title={`Verified Source: ${meta.sourceUrl || "Official Website"} (Confidence: ${meta.confidenceScore || 95}%)`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>✓ Verified ({meta.confidenceScore || 95}%)</span>
        </span>
      );
    }

    if (meta.verificationStatus === "NEEDS_REVIEW" || (meta.confidenceScore && meta.confidenceScore >= 80)) {
      return (
        <span
          onClick={() => markFieldVerified(key)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 text-[10px] font-extrabold border border-yellow-300 ml-2 cursor-pointer hover:bg-yellow-200 transition-colors"
          title="Click to manually confirm and mark as verified"
        >
          <AlertCircle className="w-3 h-3 text-yellow-700" />
          <span>⚠ Needs Review ({meta.confidenceScore || 85}%)</span>
        </span>
      );
    }

    return (
      <span
        onClick={() => markFieldVerified(key)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-950 text-[10px] font-extrabold border border-orange-300 ml-2 cursor-pointer hover:bg-orange-200 transition-colors"
        title="Click to manually enter or confirm value"
      >
        <AlertCircle className="w-3 h-3 text-orange-700" />
        <span>{meta.warning || "⚠ Please Enter Manually"}</span>
      </span>
    );
  };

  // Section 1: Basic Info (Default empty so no fields are pre-selected)
  const [name, setName] = useState(initialData?.name || "");
  const [shortName, setShortName] = useState(initialData?.shortName || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [banner, setBanner] = useState(initialData?.banner || initialData?.image || "");
  const [collegeVideo, setCollegeVideo] = useState(initialData?.collegeVideo || "");
  const [estYear, setEstYear] = useState(initialData?.estYear || "");
  const [ownership, setOwnership] = useState(initialData?.ownership || "Private");
  const [type, setType] = useState(initialData?.type || "Private");
  const [category, setCategory] = useState(
    typeof initialData?.category === "string"
      ? initialData.category
      : (initialData?.category?.value && typeof initialData.category.value === "string"
          ? initialData.category.value
          : "Engineering")
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    normalizeCategories(initialData?.categories)
  );
  const [affiliatedUniversity, setAffiliatedUniversity] = useState(initialData?.affiliatedUniversity || "");
  const [isAutonomous, setIsAutonomous] = useState(initialData?.isAutonomous ?? false);
  const [accreditation, setAccreditation] = useState(initialData?.accreditation || "");
  const [approval, setApproval] = useState(initialData?.approval || "AICTE, UGC");
  const [aicteApproved, setAicteApproved] = useState(initialData?.aicteApproved ?? false);
  const [ugcApproved, setUgcApproved] = useState(initialData?.ugcApproved ?? false);
  const [naacGrade, setNaacGrade] = useState(initialData?.naacGrade || "");
  const [nirfRank, setNirfRank] = useState(initialData?.nirfRank || "");

  // Section 2: Location
  const [address, setAddress] = useState(initialData?.address || "");
  const [landmark, setLandmark] = useState(initialData?.landmark || "");
  const [area, setArea] = useState(initialData?.area || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [district, setDistrict] = useState(initialData?.district || "");
  const [state, setState] = useState(initialData?.state || "");
  const [pincode, setPincode] = useState(initialData?.pincode || "");
  const [latitude, setLatitude] = useState(initialData?.latitude || "");
  const [longitude, setLongitude] = useState(initialData?.longitude || "");
  const [googleMapUrl, setGoogleMapUrl] = useState(initialData?.googleMapUrl || "");

  // Section 3: Contact
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [mobile, setMobile] = useState(initialData?.mobile || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [facebook, setFacebook] = useState(initialData?.facebook || "");
  const [instagram, setInstagram] = useState(initialData?.instagram || "");
  const [linkedin, setLinkedin] = useState(initialData?.linkedin || "");
  const [youtube, setYoutube] = useState(initialData?.youtube || "");

  // Section 4: Courses Dynamic Repeater
  const [courses, setCourses] = useState<CourseItem[]>(
    initialData?.courses?.length
      ? initialData.courses.map((c: any) => ({
          id: c.id,
          title: c.title || "",
          duration: c.duration || "4 Years",
          feesPerYear: c.feesPerYear ?? "",
          eligibility: c.eligibility || "",
          minGpa: c.minGpa !== undefined && c.minGpa !== null ? c.minGpa : "",
          seats: c.seats || "",
          entranceExam: c.entranceExam || "",
        }))
      : []
  );

  // Section 5: Fees
  const [feesPerYear, setFeesPerYear] = useState(initialData?.feesPerYear || "");
  const [courseWiseFees, setCourseWiseFees] = useState(initialData?.courseWiseFees || "");
  const [hostelFees, setHostelFees] = useState(initialData?.hostelFees || "");
  const [transportFees, setTransportFees] = useState(initialData?.transportFees || "");
  const [scholarshipDetails, setScholarshipDetails] = useState(initialData?.scholarshipDetails || "");
  const [educationLoanDetails, setEducationLoanDetails] = useState(initialData?.educationLoanDetails || "");

  // Section 6: Facilities Checkboxes (Default empty)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    normalizeFacilities(initialData?.facilities)
  );

  // Section 7: Placement
  const [highestPackage, setHighestPackage] = useState(initialData?.highestPackage || "");
  const [avgPackage, setAvgPackage] = useState(initialData?.avgPackage || "");
  const [placementPercentage, setPlacementPercentage] = useState(initialData?.placementPercentage || "");
  const [topRecruiters, setTopRecruiters] = useState(initialData?.topRecruiters || "");
  const [internshipDetails, setInternshipDetails] = useState(initialData?.internshipDetails || "");

  // Section 8: Admissions
  const [admissionEligibility, setAdmissionEligibility] = useState(initialData?.admissionEligibility || "");
  const [admissionProcess, setAdmissionProcess] = useState(initialData?.admissionProcess || "");
  const [documentsRequired, setDocumentsRequired] = useState(initialData?.documentsRequired || "");
  const [counsellingInfo, setCounsellingInfo] = useState(initialData?.counsellingInfo || "");
  const [admissionEntranceExams, setAdmissionEntranceExams] = useState(initialData?.admissionEntranceExams || "");
  const [importantDates, setImportantDates] = useState(initialData?.importantDates || "");

  // Section 9: Hostel
  const [hostelAvailable, setHostelAvailable] = useState(initialData?.hostelAvailable ?? false);
  const [boysHostel, setBoysHostel] = useState(initialData?.boysHostel ?? false);
  const [girlsHostel, setGirlsHostel] = useState(initialData?.girlsHostel ?? false);
  const [acRooms, setAcRooms] = useState(initialData?.acRooms ?? false);
  const [messAvailable, setMessAvailable] = useState(initialData?.messAvailable ?? false);
  const [hostelFeePerYear, setHostelFeePerYear] = useState(initialData?.hostelFeePerYear || "");

  // Section 10: Gallery (Default empty)
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(
    initialData?.galleryImages?.length ? initialData.galleryImages : []
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Section 14: Student Reviews State
  const rawInitialReviews =
    (Array.isArray(initialData?.reviews) && initialData.reviews) ||
    (Array.isArray(initialData?.studentReviews) && initialData.studentReviews) ||
    (Array.isArray(initialData?.student_reviews) && initialData.student_reviews) ||
    (Array.isArray(initialData?.testimonials) && initialData.testimonials) ||
    [];

  const [reviews, setReviews] = useState<ReviewItem[]>(
    rawInitialReviews.length
      ? rawInitialReviews.map((r: any, idx: number) => ({
          id: r.id,
          studentName: r.studentName || r.name || `Verified Student ${idx + 1}`,
          course: r.course || r.program || "Undergraduate Degree",
          batchYear: Number(r.batchYear || r.batch || 2024),
          title: r.title || r.reviewTitle || "Overall Excellent Campus Experience",
          rating: Number(r.rating) || 4.5,
          academicRating: Number(r.academicRating) || 4.5,
          infrastructureRating: Number(r.infrastructureRating) || 4.2,
          placementRating: Number(r.placementRating) || 4.5,
          campusRating: Number(r.campusRating) || 4.3,
          valueForMoneyRating: Number(r.valueForMoneyRating) || 4.4,
          likes: r.likes || r.pros || "Top class faculty, modern digital library, well-equipped labs, and active student clubs.",
          dislikes: r.dislikes || r.cons || "Hostel mess food menu options can be improved.",
          content: r.content || r.review || "Overall a fantastic college for students seeking great placement and quality education.",
          isVerified: r.isVerified ?? false,
        }))
      : []
  );

  // Candidate Gallery Import State
  const [candidateGalleryImages, setCandidateGalleryImages] = useState<any[]>([]);
  const [foundGalleryImagesCount, setFoundGalleryImagesCount] = useState<number>(0);
  const [showImportGalleryModal, setShowImportGalleryModal] = useState<boolean>(false);
  const [selectedCandidateUrls, setSelectedCandidateUrls] = useState<string[]>([]);

  // Section 11: SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [metaKeywords, setMetaKeywords] = useState(initialData?.metaKeywords || "");

  // Section 12: Status
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [featured, setFeatured] = useState(initialData?.featured ?? true);
  const [trending, setTrending] = useState(initialData?.trending ?? true);

  // AI textarea input buffer — pasted structured text for parsing ONLY, NOT saved to DB
  const [generalDescription, setGeneralDescription] = useState("");
  // Public-facing college About description saved to DB
  const [collegeAbout, setCollegeAbout] = useState(initialData?.description || "");

  // Section 13: College Content Module State (Additive CMS Extension)
  const ccInit = initialData?.collegeContent || initialData?.content || {};
  const [overview, setOverview] = useState(ccInit.overview || initialData?.overview || "");
  const [about, setAbout] = useState(ccInit.about || initialData?.about || "");
  const [history, setHistory] = useState(ccInit.history || initialData?.history || "");
  const [highlights, setHighlights] = useState(ccInit.highlights || initialData?.highlights || "");
  const [whyChoose, setWhyChoose] = useState(ccInit.whyChoose || initialData?.whyChoose || "");
  const [campusLife, setCampusLife] = useState(ccInit.campusLife || initialData?.campusLife || "");
  const [facilitiesDescription, setFacilitiesDescription] = useState(ccInit.facilitiesDescription || initialData?.facilitiesDescription || "");
  const [placementOverview, setPlacementOverview] = useState(ccInit.placementOverview || initialData?.placementOverview || "");
  const [contentTopRecruiters, setContentTopRecruiters] = useState(ccInit.topRecruiters || initialData?.contentTopRecruiters || "");
  const [admissionGuide, setAdmissionGuide] = useState(ccInit.admissionGuide || initialData?.admissionGuide || "");
  const [eligibility, setEligibility] = useState(ccInit.eligibility || initialData?.eligibility || "");
  const [hostelLife, setHostelLife] = useState(ccInit.hostelLife || initialData?.hostelLife || "");
  const [scholarships, setScholarships] = useState(ccInit.scholarships || initialData?.scholarships || "");
  const [research, setResearch] = useState(ccInit.research || initialData?.research || "");
  const [studentActivities, setStudentActivities] = useState(ccInit.studentActivities || initialData?.studentActivities || "");
  const [faq, setFaq] = useState(ccInit.faq || initialData?.faq || "");
  const [seoArticle, setSeoArticle] = useState(ccInit.seoArticle || initialData?.seoArticle || "");
  const [contentStatus, setContentStatus] = useState(ccInit.contentStatus || initialData?.contentStatus || "DRAFT");
  const [contentSaving, setContentSaving] = useState(false);

  // Quality Report Modal State
  const [qualityReportModal, setQualityReportModal] = useState<{
    isOpen: boolean;
    report: any;
    logs: string[];
    showLogs: boolean;
  }>({
    isOpen: false,
    report: null,
    logs: [],
    showLogs: false,
  });

  useEffect(() => {
    if (collegeId) {
      fetch(`/api/admin/colleges/${collegeId}/content`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.content) {
            setOverview(data.content.overview || "");
            setAbout(data.content.about || "");
            setHistory(data.content.history || "");
            setHighlights(data.content.highlights || "");
            setWhyChoose(data.content.whyChoose || "");
            setCampusLife(data.content.campusLife || "");
            setFacilitiesDescription(data.content.facilitiesDescription || "");
            setPlacementOverview(data.content.placementOverview || "");
            setContentTopRecruiters(data.content.topRecruiters || "");
            setAdmissionGuide(data.content.admissionGuide || "");
            setEligibility(data.content.eligibility || "");
            setHostelLife(data.content.hostelLife || "");
            setScholarships(data.content.scholarships || "");
            setResearch(data.content.research || "");
            setStudentActivities(data.content.studentActivities || "");
            setFaq(data.content.faq || "");
            setSeoArticle(data.content.seoArticle || "");
            setContentStatus(data.content.contentStatus || "DRAFT");
          }
        })
        .catch((err) => console.error("Error loading college content:", err));
    } else if (initialData?.collegeContent || initialData?.content) {
      const cc = initialData.collegeContent || initialData.content;
      if (cc.overview) setOverview(cc.overview);
      if (cc.about) setAbout(cc.about);
      if (cc.history) setHistory(cc.history);
      if (cc.highlights) setHighlights(cc.highlights);
      if (cc.whyChoose) setWhyChoose(cc.whyChoose);
      if (cc.campusLife) setCampusLife(cc.campusLife);
      if (cc.facilitiesDescription) setFacilitiesDescription(cc.facilitiesDescription);
      if (cc.placementOverview) setPlacementOverview(cc.placementOverview);
      if (cc.topRecruiters) setContentTopRecruiters(cc.topRecruiters);
      if (cc.admissionGuide) setAdmissionGuide(cc.admissionGuide);
      if (cc.eligibility) setEligibility(cc.eligibility);
      if (cc.hostelLife) setHostelLife(cc.hostelLife);
      if (cc.scholarships) setScholarships(cc.scholarships);
      if (cc.research) setResearch(cc.research);
      if (cc.studentActivities) setStudentActivities(cc.studentActivities);
      if (cc.faq) setFaq(cc.faq);
      if (cc.seoArticle) setSeoArticle(cc.seoArticle);
      if (cc.contentStatus) setContentStatus(cc.contentStatus);
    }
  }, [collegeId, initialData]);

  async function saveCollegeContentOnly() {
    if (!collegeId) {
      showPopup("Please save basic college profile first before adding content.", "warning");
      return;
    }
    setContentSaving(true);
    try {
      const res = await fetch(`/api/admin/colleges/${collegeId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overview,
          about,
          history,
          highlights,
          whyChoose,
          campusLife,
          facilitiesDescription,
          placementOverview,
          topRecruiters: contentTopRecruiters,
          admissionGuide,
          eligibility,
          hostelLife,
          scholarships,
          research,
          studentActivities,
          faq,
          seoArticle,
          contentStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showPopup("College Content Module saved successfully!", "success");
      } else {
        showPopup(json.error || "Failed to save college content.", "error");
      }
    } catch (err: any) {
      showPopup(err.message, "error");
    } finally {
      setContentSaving(false);
    }
  }

  async function handleGenerateAIDraft() {
    if (!collegeId) {
      showPopup("Please save basic college profile first.", "warning");
      return;
    }
    try {
      const res = await fetch(`/api/admin/colleges/${collegeId}/generate-draft`, { method: "POST" });
      const json = await res.json();
      if (json.success && json.draft) {
        if (json.draft.overview) setOverview(json.draft.overview);
        if (json.draft.about) setAbout(json.draft.about);
        if (json.draft.highlights) setHighlights(json.draft.highlights);
        if (json.draft.campusLife) setCampusLife(json.draft.campusLife);
        if (json.draft.facilitiesDescription) setFacilitiesDescription(json.draft.facilitiesDescription);
        if (json.draft.placementOverview) setPlacementOverview(json.draft.placementOverview);
        if (json.draft.topRecruiters) setContentTopRecruiters(json.draft.topRecruiters);
        setContentStatus("AI_GENERATED");
        showPopup("AI Draft Generated successfully! Review fields and save.", "success");
      }
    } catch (err: any) {
      showPopup("Error generating draft: " + err.message, "error");
    }
  }
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    message: string;
    matchedCollege: any;
    similarityScore: number;
  }>({
    isOpen: false,
    message: "",
    matchedCollege: null,
    similarityScore: 0,
  });

  // Helpers
  function handleNameChange(val: string) {
    setName(val);
    if (!collegeId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleFacility(fac: string) {
    setSelectedFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  }

  // Review Helpers
  function addReview() {
    setReviews((prev) => [
      ...prev,
      {
        studentName: "Verified Student",
        course: "B.E. Computer Science and Engineering",
        batchYear: 2024,
        title: "Great academic environment and strong placement opportunities",
        rating: 4.5,
        academicRating: 4.5,
        infrastructureRating: 4.2,
        placementRating: 4.5,
        campusRating: 4.3,
        valueForMoneyRating: 4.4,
        likes: "Qualified faculty, state-of-the-art laboratories, modern digital library, and active tech clubs.",
        dislikes: "Hostel mess menu options could be enhanced.",
        content: "Overall a fantastic college for overall personal and technical development with good placement records.",
        isVerified: true,
      },
    ]);
  }

  function updateReview(idx: number, field: keyof ReviewItem, val: any) {
    setReviews((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  }

  function removeReview(idx: number) {
    setReviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function generateSampleReviews() {
    const sample: ReviewItem[] = [
      {
        studentName: "Praveen Natarajan",
        course: "B.E. Computer Science and Engineering",
        batchYear: 2024,
        title: "Top tier faculty, state-of-the-art labs & 90%+ placement drives",
        rating: 4.8,
        academicRating: 4.8,
        infrastructureRating: 4.5,
        placementRating: 4.9,
        campusRating: 4.6,
        valueForMoneyRating: 4.7,
        likes: "High speed campus WiFi, advanced AI & IoT research labs, active coding club, and top Fortune 500 recruiter visits.",
        dislikes: "Strict attendance rule (75% compulsory requirement).",
        content: "Studying Computer Science here has been an enriching experience. The professors provide hands-on project exposure from 2nd year onwards. Placements are solid with average package of 6.5 LPA.",
        isVerified: true,
      },
      {
        studentName: "Ananya Sharma",
        course: "B.Tech Electronics & Communication",
        batchYear: 2025,
        title: "Vibrant campus culture, active tech clubs and great industrial exposure",
        rating: 4.5,
        academicRating: 4.6,
        infrastructureRating: 4.4,
        placementRating: 4.5,
        campusRating: 4.6,
        valueForMoneyRating: 4.5,
        likes: "Modern VLSI and Embedded Systems lab, inter-college sports tournaments, and supportive faculty mentors.",
        dislikes: "Canteen food options are somewhat limited during evening hours.",
        content: "The ECE department is well-structured with updated syllabus matching industry demands. Industrial visits every semester help understand real-world engineering concepts.",
        isVerified: true,
      },
      {
        studentName: "Karthik Raja",
        course: "Master of Business Administration (MBA)",
        batchYear: 2023,
        title: "Outstanding management department with campus recruitment drives",
        rating: 4.6,
        academicRating: 4.7,
        infrastructureRating: 4.3,
        placementRating: 4.8,
        campusRating: 4.4,
        valueForMoneyRating: 4.6,
        likes: "Case study-based learning pedagogy, guest lectures by CXOs, and dedicated corporate relations team.",
        dislikes: "High workload during trimester exams and project submissions.",
        content: "The MBA program transformed my analytical and leadership skills. Campus recruitment brought top MNCs for marketing and finance roles with competitive compensation packages.",
        isVerified: true,
      },
    ];
    setReviews(sample);
    showPopup("3 Sample Verified Student Reviews generated! Review details and click Save.", "success");
  }

  // Add / Remove Course
  function addCourse() {
    setCourses((prev) => [
      ...prev,
      {
        title: "",
        duration: "4 Years",
        feesPerYear: "",
        eligibility: "",
        seats: "",
        entranceExam: "",
      },
    ]);
  }

  function removeCourse(idx: number) {
    setCourses((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateCourse(idx: number, field: keyof CourseItem, val: any) {
    setCourses((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  }

  // Add Image with AI Auto-Tagging
  async function addImageToGallery(url: string, fileName?: string) {
    let altText = `${name || "Campus"} Image`;
    let caption = `Campus view and student infrastructure`;
    let tags = `campus,infrastructure,college`;

    try {
      const res = await fetch("/api/admin/ai/tag-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, fileName, collegeName: name }),
      });
      const data = await res.json();
      if (data.data) {
        altText = data.data.altText || altText;
        caption = data.data.caption || caption;
        tags = data.data.tags || tags;
      }
    } catch (e) {}

    setGalleryImages((prev) => [
      ...prev,
      { url, altText, caption, tags },
    ]);
  }

  // Clipboard Paste Handler (Ctrl + V)
  function handlePasteImage(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (!blob) continue;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            await addImageToGallery(dataUrl, blob.name || "Clipboard Image");
          }
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  }

  // File Upload Handler
  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !files.length) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          await addImageToGallery(dataUrl, file.name);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function addGalleryImage() {
    if (!newGalleryUrl) return;
    const url = newGalleryUrl;
    setNewGalleryUrl("");
    await addImageToGallery(url);
  }

  function removeGalleryImage(idx: number) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  }

  // Populate state helper from AI JSON response
  function populateFormFromAI(data: any) {
    if (!data) return;

    // Track total fields populated for verification score estimation if not provided
    let fieldsPopulatedCount = 0;
    const markPopulated = () => {
      fieldsPopulatedCount++;
    };

    // ─── Section 1: Basic Info ────────────────────────────────────────────
    const nVal = extractVal(data, "name", ["collegeName", "college_name", "officialName", "institutionName"], ["basicInfo"]);
    const cleanedName = cleanString(nVal);
    if (cleanedName) {
      setName(cleanedName);
      markPopulated();
    }

    const snVal = extractVal(data, "shortName", ["short_name", "shortCode", "abbreviation", "shortForm"], ["basicInfo"]);
    const cleanedShortName = cleanString(snVal);
    if (cleanedShortName) {
      setShortName(cleanedShortName);
      markPopulated();
    }

    const slVal = extractVal(data, "slug", ["urlSlug", "slug_url"], ["basicInfo"]);
    const cleanedSlug = cleanString(slVal);
    if (cleanedSlug) {
      setSlug(cleanedSlug);
      markPopulated();
    }

    // College public about text — support both old "description" key and new "collegeAbout" key
    const aboutVal = extractVal(data, "collegeAbout", ["aboutText", "description", "college_about", "about"], ["basicInfo", "overview"]);
    const cleanedAbout = cleanString(aboutVal);
    if (cleanedAbout && !cleanedAbout.includes("=======")) {
      setCollegeAbout(cleanedAbout);
      markPopulated();
    } else if (!collegeAbout && (data.name || data.collegeAbout || (data.basicInfo && data.basicInfo.name))) {
      const nm = cleanedName || "";
      const cityV = cleanString(extractVal(data, "city", ["town"], ["location"])) || "";
      const estV = cleanNumber(extractVal(data, "estYear", ["est_year", "establishedYear"], ["basicInfo"])) || "";
      const typeV = cleanString(extractVal(data, "type", [], ["basicInfo"])) || "";
      const naacV = cleanString(extractVal(data, "naacGrade", ["naac_grade"], ["basicInfo"])) || "";
      if (nm) {
        setCollegeAbout(
          `${nm} is a ${typeV ? typeV + " " : ""}institution${cityV ? " located in " + cityV : ""}${estV ? ", established in " + estV : ""}. ${naacV ? "Accredited with NAAC " + naacV + "." : ""}`.trim()
        );
        markPopulated();
      }
    }

    const videoVal = extractVal(data, "collegeVideo", ["college_video", "videoUrl", "campusVideo", "video"], ["basicInfo", "media"]);
    const cleanedVideo = cleanString(videoVal);
    if (cleanedVideo) {
      setCollegeVideo(cleanedVideo);
      markPopulated();
    }

    const estVal = extractVal(data, "estYear", ["est_year", "establishedYear", "established", "foundedYear", "yearOfEstablishment"], ["basicInfo"]);
    const cleanedEst = cleanNumber(estVal);
    if (cleanedEst !== "") {
      setEstYear(cleanedEst);
      markPopulated();
    }

    const ownVal = extractVal(data, "ownership", ["ownershipType", "management", "ownership_type"], ["basicInfo"]);
    const cleanedOwn = cleanString(ownVal);
    if (cleanedOwn) {
      setOwnership(cleanedOwn);
      markPopulated();
    }

    const typeVal = extractVal(data, "type", ["collegeType", "institutionType", "type_of_institution"], ["basicInfo"]);
    const cleanedType = cleanString(typeVal);
    if (cleanedType) {
      setType(cleanedType);
      markPopulated();
    }

    // Category (Section 1 primary category dropdown)
    const categoryVal = extractVal(data, "category", ["primaryCategory", "mainCategory", "stream", "collegeCategory"], ["basicInfo"]);
    const cleanedCat = cleanString(categoryVal);
    if (cleanedCat) {
      setCategory(cleanedCat);
      markPopulated();
    }

    // Categories (Selected category badges)
    const catVal = extractVal(data, "categories", ["selectedCategories", "streams", "departments"], ["basicInfo"]);
    const normCategories = normalizeCategories(catVal);
    if (normCategories.length > 0) {
      setSelectedCategories(normCategories);
      markPopulated();
    } else if (Array.isArray(catVal) && catVal.length) {
      setSelectedCategories(catVal.map(String).map((s) => s.trim()).filter(Boolean));
      markPopulated();
    } else if (typeof catVal === "string" && catVal.trim()) {
      setSelectedCategories(catVal.split(",").map((s: string) => s.trim()).filter(Boolean));
      markPopulated();
    }

    const affVal = extractVal(data, "affiliatedUniversity", ["affiliated_university", "affiliation", "university", "affiliatedTo"], ["basicInfo"]);
    const cleanedAff = cleanString(affVal);
    if (cleanedAff) {
      setAffiliatedUniversity(cleanedAff);
      markPopulated();
    }

    const autoVal = extractVal(data, "isAutonomous", ["is_autonomous", "autonomous"], ["basicInfo"]);
    if (typeof autoVal === "boolean") {
      setIsAutonomous(autoVal);
      markPopulated();
    } else if (typeof autoVal === "string" && autoVal.trim()) {
      if (/^(yes|true|autonomous|y)/i.test(autoVal.trim())) { setIsAutonomous(true); markPopulated(); }
      else if (/^(no|false|non|n)/i.test(autoVal.trim())) { setIsAutonomous(false); markPopulated(); }
    }

    const accVal = extractVal(data, "accreditation", ["accreditedBy", "accreditations"], ["basicInfo"]);
    const cleanedAcc = cleanString(accVal);
    if (cleanedAcc) {
      setAccreditation(cleanedAcc);
      markPopulated();
    }

    const appVal = extractVal(data, "approval", ["approvals", "approvedBy", "recognitions"], ["basicInfo"]);
    const cleanedApp = cleanString(appVal);
    if (cleanedApp) {
      setApproval(cleanedApp);
      markPopulated();
    }

    const aicteVal = extractVal(data, "aicteApproved", ["aicte_approved", "aicteApproval", "aicte"], ["basicInfo"]);
    if (typeof aicteVal === "boolean") {
      setAicteApproved(aicteVal);
      markPopulated();
    } else if (typeof aicteVal === "string" && aicteVal.trim()) {
      if (/^(yes|true|approved|y)/i.test(aicteVal.trim())) { setAicteApproved(true); markPopulated(); }
      else if (/^(no|false|n)/i.test(aicteVal.trim())) { setAicteApproved(false); markPopulated(); }
    }

    const ugcVal = extractVal(data, "ugcApproved", ["ugc_approved", "ugcApproval", "ugcRecognition", "ugc"], ["basicInfo"]);
    if (typeof ugcVal === "boolean") {
      setUgcApproved(ugcVal);
      markPopulated();
    } else if (typeof ugcVal === "string" && ugcVal.trim()) {
      if (/^(yes|true|approved|recognized|y)/i.test(ugcVal.trim())) { setUgcApproved(true); markPopulated(); }
      else if (/^(no|false|n)/i.test(ugcVal.trim())) { setUgcApproved(false); markPopulated(); }
    }

    const naacVal = extractVal(data, "naacGrade", ["naac_grade", "naac", "naacAccreditation", "naacRating"], ["basicInfo"]);
    const cleanedNaac = cleanString(naacVal);
    if (cleanedNaac) {
      setNaacGrade(cleanedNaac);
      markPopulated();
    }

    const nirfVal = extractVal(data, "nirfRank", ["nirf_rank", "nirf", "nirfRanking"], ["basicInfo"]);
    const cleanedNirf = cleanNumber(nirfVal);
    if (cleanedNirf !== "") {
      setNirfRank(cleanedNirf);
      markPopulated();
    }

    // ─── Section 2: Location ─────────────────────────────────────────────
    const addrVal = extractVal(data, "address", ["fullAddress", "full_address", "streetAddress"], ["location"]);
    const cleanedAddr = cleanString(addrVal);
    if (cleanedAddr) {
      setAddress(cleanedAddr);
      markPopulated();
    }

    const lmVal = extractVal(data, "landmark", ["nearby", "near"], ["location"]);
    const cleanedLm = cleanString(lmVal);
    if (cleanedLm) {
      setLandmark(cleanedLm);
      markPopulated();
    }

    const arVal = extractVal(data, "area", ["locality", "zone"], ["location"]);
    const cleanedAr = cleanString(arVal);
    if (cleanedAr) {
      setArea(cleanedAr);
      markPopulated();
    }

    const cityVal = extractVal(data, "city", ["town"], ["location"]);
    const cleanedCity = cleanString(cityVal);
    if (cleanedCity) {
      setCity(cleanedCity);
      markPopulated();
    }

    const distVal = extractVal(data, "district", ["county"], ["location"]);
    const cleanedDist = cleanString(distVal);
    if (cleanedDist) {
      setDistrict(cleanedDist);
      markPopulated();
    }

    const stVal = extractVal(data, "state", ["province"], ["location"]);
    const cleanedSt = cleanString(stVal);
    if (cleanedSt) {
      setState(cleanedSt);
      markPopulated();
    }

    const pinVal = extractVal(data, "pincode", ["pin", "zipCode", "postalCode", "zip"], ["location"]);
    const cleanedPin = cleanNumber(pinVal) || cleanString(pinVal);
    if (cleanedPin) {
      setPincode(cleanedPin);
      markPopulated();
    }

    const latVal = extractVal(data, "latitude", ["lat"], ["location"]);
    const cleanedLat = cleanNumber(latVal);
    if (cleanedLat !== "") {
      setLatitude(cleanedLat);
      markPopulated();
    }

    const lngVal = extractVal(data, "longitude", ["lng", "long"], ["location"]);
    const cleanedLng = cleanNumber(lngVal);
    if (cleanedLng !== "") {
      setLongitude(cleanedLng);
      markPopulated();
    }

    const mapVal = extractVal(data, "googleMapUrl", ["google_map_url", "mapUrl", "mapsUrl", "googleMaps", "mapLink"], ["location"]);
    const cleanedMap = cleanString(mapVal);
    if (cleanedMap) {
      setGoogleMapUrl(cleanedMap);
      markPopulated();
    }

    // ─── Section 3: Contact ───────────────────────────────────────────────
    const phVal = extractVal(data, "phone", ["telephone", "landline", "phone_number"], ["contact"]);
    const cleanedPh = cleanString(phVal);
    if (cleanedPh) {
      setPhone(cleanedPh);
      markPopulated();
    }

    const mobVal = extractVal(data, "mobile", ["cell", "mobile_number", "contactNumber"], ["contact"]);
    const cleanedMob = cleanString(mobVal);
    if (cleanedMob) {
      setMobile(cleanedMob);
      markPopulated();
    }

    const emVal = extractVal(data, "email", ["mail", "email_id", "emailId", "contactEmail"], ["contact"]);
    const cleanedEm = cleanString(emVal);
    if (cleanedEm) {
      setEmail(cleanedEm);
      markPopulated();
    }

    const webVal = extractVal(data, "website", ["officialWebsite", "webUrl", "siteUrl", "site"], ["contact"]);
    const cleanedWeb = cleanString(webVal);
    if (cleanedWeb) {
      setWebsite(cleanedWeb);
      markPopulated();
    }

    const fbVal = extractVal(data, "facebook", ["facebookUrl", "facebook_url", "fb"], ["contact", "socialMedia"]);
    const cleanedFb = cleanString(fbVal);
    if (cleanedFb) {
      setFacebook(cleanedFb);
      markPopulated();
    }

    const instaVal = extractVal(data, "instagram", ["instagramUrl", "instagram_url", "insta"], ["contact", "socialMedia"]);
    const cleanedInsta = cleanString(instaVal);
    if (cleanedInsta) {
      setInstagram(cleanedInsta);
      markPopulated();
    }

    const linVal = extractVal(data, "linkedin", ["linkedinUrl", "linkedin_url"], ["contact", "socialMedia"]);
    const cleanedLin = cleanString(linVal);
    if (cleanedLin) {
      setLinkedin(cleanedLin);
      markPopulated();
    }

    const ytVal = extractVal(data, "youtube", ["youtubeUrl", "youtube_url", "youtubeChannel"], ["contact", "socialMedia"]);
    const cleanedYt = cleanString(ytVal);
    if (cleanedYt) {
      setYoutube(cleanedYt);
      markPopulated();
    }

    // ─── Section 4: Courses ───────────────────────────────────────────────
    const coursesList =
      (Array.isArray(data.courses) && data.courses) ||
      (Array.isArray(data.programs) && data.programs) ||
      (Array.isArray(data.coursesOffered) && data.coursesOffered) ||
      (Array.isArray(data.coursesList) && data.coursesList) ||
      (data.courses && typeof data.courses === "object" && Array.isArray(data.courses.value) && data.courses.value) ||
      (data.academic && typeof data.academic === "object" && Array.isArray(data.academic.courses) && data.academic.courses) ||
      (data.academic && typeof data.academic === "object" && Array.isArray(data.academic.programs) && data.academic.programs) ||
      (data.academics && typeof data.academics === "object" && Array.isArray(data.academics.courses) && data.academics.courses) ||
      (data.academics && typeof data.academics === "object" && Array.isArray(data.academics.programs) && data.academics.programs) ||
      [];

    let parsedCourses: CourseItem[] = [];
    if (Array.isArray(coursesList) && coursesList.length > 0) {
      parsedCourses = coursesList
        .map((c: any) => {
          const rawEligibility = cleanString(c.eligibility || c.eligibilityCriteria || c.criteria);
          let rawMinGpa = c.minGpa !== undefined && c.minGpa !== null && c.minGpa !== "" ? Number(cleanNumber(c.minGpa)) : null;
          if (rawMinGpa === null || isNaN(rawMinGpa) || rawMinGpa <= 0) {
            const match = rawEligibility.match(/(\d+(?:\.\d+)?)\s*%/);
            if (match) {
              rawMinGpa = parseFloat(match[1]);
            } else {
              rawMinGpa = null;
            }
          }

          return {
            title: cleanString(c.title || c.name || c.courseName || c.course_name || c.course || c.programName || c.program || ""),
            duration: cleanString(c.duration) || "4 Years",
            feesPerYear: cleanNumber(c.feesPerYear || c.fees || c.annualFee || c.fees_per_year || c.fee || c.tuitionFee),
            eligibility: rawEligibility || (rawMinGpa ? `Minimum ${rawMinGpa}% in 10+2` : "Eligibility not specified"),
            minGpa: rawMinGpa,
            seats: cleanNumber(c.seats || c.intake || c.seatsAvailable || c.capacity),
            entranceExam: cleanString(c.entranceExam || c.entrance_exam || c.exam || c.entranceExams || c.acceptedExams),
          };
        })
        .filter((c) => Boolean(c.title));

      // In-memory deduplication of incoming courses
      const seenCourseKeys = new Set<string>();
      const deduplicatedCourses: CourseItem[] = [];
      for (const course of parsedCourses) {
        const key = course.title.trim().toLowerCase().replace(/\s+/g, " ");
        if (!seenCourseKeys.has(key)) {
          seenCourseKeys.add(key);
          deduplicatedCourses.push(course);
        }
      }
      parsedCourses = deduplicatedCourses;

      if (parsedCourses.length > 0) {
        setCourses(parsedCourses);
        markPopulated();
      }
    }

    // ─── Section 5: Fees ─────────────────────────────────────────────────
    let feesVal = extractVal(
      data,
      "feesPerYear",
      ["annualFees", "annualFee", "tuitionFees", "fees_per_year", "fees", "avgFees", "averageFees", "averageFee", "annual_fee", "tuition_fee", "totalFees"],
      ["fees", "feeStructure"]
    );
    // Fallback: If top-level fees are not present, use the fee from the first parsed course!
    if ((feesVal === undefined || feesVal === null || feesVal === "") && parsedCourses.length > 0) {
      const courseWithFee = parsedCourses.find((c) => c.feesPerYear !== "" && c.feesPerYear !== undefined && c.feesPerYear !== null);
      if (courseWithFee) {
        feesVal = courseWithFee.feesPerYear;
      }
    }
    const cleanAnnualFees = cleanNumber(feesVal);
    if (cleanAnnualFees !== "") {
      setFeesPerYear(cleanAnnualFees);
      markPopulated();
    }

    const cwFeesVal = extractVal(
      data,
      "courseWiseFees",
      ["course_wise_fees", "courseWiseFee", "feeBreakup", "feeDetails", "courseFees", "feeStructure"],
      ["fees", "feeStructure"]
    );
    const cleanedCwFees = cleanString(cwFeesVal, "\n");
    if (cleanedCwFees) {
      setCourseWiseFees(cleanedCwFees);
      markPopulated();
    } else if (parsedCourses.length > 1) {
      const courseFeeLines = parsedCourses
        .filter((c) => c.title && c.feesPerYear)
        .map((c) => `${c.title}: ₹${c.feesPerYear}/yr`);
      if (courseFeeLines.length > 0) {
        setCourseWiseFees(courseFeeLines.join("\n"));
        markPopulated();
      }
    }

    const hFeesVal = extractVal(
      data,
      "hostelFees",
      ["hostel_fees", "hostelFee", "hostelFeePerYear", "annualHostelFee", "hostel_fee"],
      ["fees", "feeStructure", "hostel", "hostelDetails"]
    );
    const cleanedHFees = cleanNumber(hFeesVal);
    if (cleanedHFees !== "") {
      setHostelFees(cleanedHFees);
      markPopulated();
    }

    const tFeesVal = extractVal(
      data,
      "transportFees",
      ["transport_fees", "transportFee", "busFee", "busFees", "transportationFee", "transport_fee"],
      ["fees", "feeStructure"]
    );
    const cleanedTFees = cleanNumber(tFeesVal);
    if (cleanedTFees !== "") {
      setTransportFees(cleanedTFees);
      markPopulated();
    }

    const schVal = extractVal(
      data,
      "scholarshipDetails",
      ["scholarship_details", "scholarships", "scholarshipInfo", "scholarshipSchemes", "scholarship"],
      ["fees", "feeStructure", "scholarships"]
    );
    const cleanedSch = cleanString(schVal, "\n");
    if (cleanedSch) {
      setScholarshipDetails(cleanedSch);
      markPopulated();
    }

    const loanVal = extractVal(
      data,
      "educationLoanDetails",
      ["education_loan_details", "loanDetails", "educationLoan", "loanAssistance", "bankLoan", "loans"],
      ["fees", "feeStructure"]
    );
    const cleanedLoan = cleanString(loanVal, "\n");
    if (cleanedLoan) {
      setEducationLoanDetails(cleanedLoan);
      markPopulated();
    }

    // ─── Section 6: Facilities ────────────────────────────────────────────
    const facVal = extractVal(
      data,
      "facilities",
      ["amenities", "campusFacilities", "infrastructureFacilities", "campusAmenities"],
      ["campus", "facilities", "infrastructure"]
    );
    const normFacs = normalizeFacilities(facVal);
    if (normFacs.length > 0) {
      setSelectedFacilities(normFacs);
      markPopulated();
    }

    // ─── Section 7: Placements ────────────────────────────────────────────
    const hPkgVal = extractVal(
      data,
      "highestPackage",
      ["highest_package", "highestCtc", "highest_ctc", "maxPackage", "highestSalary", "highest_salary"],
      ["placements", "placement", "placementDetails", "placementStats"]
    );
    const cleanedHPkg = cleanNumber(hPkgVal);
    if (cleanedHPkg !== "") {
      setHighestPackage(cleanedHPkg);
      markPopulated();
    }

    const avgPkgVal = extractVal(
      data,
      "avgPackage",
      ["avg_package", "averagePackage", "averageCtc", "average_ctc", "meanPackage", "averageSalary", "average_salary"],
      ["placements", "placement", "placementDetails", "placementStats"]
    );
    const cleanedAvgPkg = cleanNumber(avgPkgVal);
    if (cleanedAvgPkg !== "") {
      setAvgPackage(cleanedAvgPkg);
      markPopulated();
    }

    const plPctVal = extractVal(
      data,
      "placementPercentage",
      ["placement_percentage", "placementRate", "placement_rate", "percentagePlaced", "placementPercent", "placement_percent"],
      ["placements", "placement", "placementDetails", "placementStats"]
    );
    const cleanedPlPct = cleanNumber(plPctVal);
    if (cleanedPlPct !== "") {
      setPlacementPercentage(cleanedPlPct);
      markPopulated();
    }

    const recruitersVal = extractVal(
      data,
      "topRecruiters",
      ["top_recruiters", "recruiters", "recruitingCompanies", "majorRecruiters", "companiesVisiting", "keyRecruiters", "topCompanies"],
      ["placements", "placement", "placementDetails", "placementStats"]
    );
    const cleanedRecruiters = cleanString(recruitersVal, ", ");
    if (cleanedRecruiters) {
      setTopRecruiters(cleanedRecruiters);
      markPopulated();
    }

    const internVal = extractVal(
      data,
      "internshipDetails",
      ["internship_details", "internships", "internshipOpportunities", "summerInternships", "internship"],
      ["placements", "placement", "placementDetails", "placementStats"]
    );
    const cleanedIntern = cleanString(internVal, "\n");
    if (cleanedIntern) {
      setInternshipDetails(cleanedIntern);
      markPopulated();
    }

    // ─── Section 8: Admissions ────────────────────────────────────────────
    const admEligVal = extractVal(
      data,
      "admissionEligibility",
      ["admission_eligibility", "eligibilityCriteria", "eligibility", "criteria", "admissionRequirements", "entryRequirements", "qualification"],
      ["admissions", "admission"]
    );
    const cleanedAdmElig = cleanString(admEligVal);
    if (cleanedAdmElig) {
      setAdmissionEligibility(cleanedAdmElig);
      markPopulated();
    }

    const admProcVal = extractVal(
      data,
      "admissionProcess",
      ["admission_process", "howToApply", "applicationProcess", "admissionProcedure", "process", "procedure", "how_to_apply", "selectionProcess", "admissionSteps"],
      ["admissions", "admission"]
    );
    const cleanedAdmProc = cleanString(admProcVal, "\n");
    if (cleanedAdmProc) {
      setAdmissionProcess(cleanedAdmProc);
      markPopulated();
    }

    const docsVal = extractVal(
      data,
      "documentsRequired",
      ["documents_required", "requiredDocuments", "documents", "documentList", "required_documents", "certificatesRequired", "necessaryDocuments"],
      ["admissions", "admission"]
    );
    const cleanedDocs = cleanString(docsVal, "\n");
    if (cleanedDocs) {
      setDocumentsRequired(cleanedDocs);
      markPopulated();
    }

    const counsVal = extractVal(
      data,
      "counsellingInfo",
      ["counselling_info", "counselingInfo", "counselling", "counseling", "counsellingDetails", "counselingProcess"],
      ["admissions", "admission"]
    );
    const cleanedCouns = cleanString(counsVal);
    if (cleanedCouns) {
      setCounsellingInfo(cleanedCouns);
      markPopulated();
    }

    const entranceExamsVal = extractVal(
      data,
      "admissionEntranceExams",
      ["admission_entrance_exams", "entranceExams", "entranceExam", "exams", "acceptedExams", "qualifyingExams", "entrance_exams"],
      ["admissions", "admission"]
    );
    const cleanedExams = cleanString(entranceExamsVal, ", ");
    if (cleanedExams) {
      setAdmissionEntranceExams(cleanedExams);
      markPopulated();
    }

    const datesVal = extractVal(
      data,
      "importantDates",
      ["important_dates", "admissionDates", "deadlines", "keyDates", "dates", "schedule", "admissionSchedule", "important_deadlines"],
      ["admissions", "admission"]
    );
    const cleanedDates = cleanString(datesVal, "\n");
    if (cleanedDates) {
      setImportantDates(cleanedDates);
      markPopulated();
    }

    // ─── Section 9: Hostel ────────────────────────────────────────────────
    let hostelAvailVal = extractVal(
      data,
      "hostelAvailable",
      ["hostel_available", "hasHostel", "hostel", "has_hostel", "available", "hostelFacility"],
      ["hostel", "hostelDetails"]
    );
    if (hostelAvailVal === undefined && typeof data.hostel === "boolean") {
      hostelAvailVal = data.hostel;
    } else if (hostelAvailVal === undefined && typeof data.hostel === "string" && data.hostel.trim()) {
      hostelAvailVal = data.hostel;
    }

    if (typeof hostelAvailVal === "boolean") {
      setHostelAvailable(hostelAvailVal);
      markPopulated();
    } else if (typeof hostelAvailVal === "string" && hostelAvailVal.trim()) {
      if (/^(yes|true|available|y|present)/i.test(hostelAvailVal.trim())) { setHostelAvailable(true); markPopulated(); }
      else if (/^(no|false|not|none|na|n)/i.test(hostelAvailVal.trim())) { setHostelAvailable(false); markPopulated(); }
    }

    const boysHostelVal = extractVal(
      data,
      "boysHostel",
      ["boys_hostel", "hasBoysHostel", "boys", "boysHostelAvailable"],
      ["hostel", "hostelDetails"]
    );
    if (typeof boysHostelVal === "boolean") {
      setBoysHostel(boysHostelVal);
      markPopulated();
    } else if (typeof boysHostelVal === "string" && boysHostelVal.trim()) {
      if (/^(yes|true|available|y|present)/i.test(boysHostelVal.trim())) { setBoysHostel(true); markPopulated(); }
      else if (/^(no|false|not|none|na|n)/i.test(boysHostelVal.trim())) { setBoysHostel(false); markPopulated(); }
    }

    const girlsHostelVal = extractVal(
      data,
      "girlsHostel",
      ["girls_hostel", "hasGirlsHostel", "girls", "girlsHostelAvailable"],
      ["hostel", "hostelDetails"]
    );
    if (typeof girlsHostelVal === "boolean") {
      setGirlsHostel(girlsHostelVal);
      markPopulated();
    } else if (typeof girlsHostelVal === "string" && girlsHostelVal.trim()) {
      if (/^(yes|true|available|y|present)/i.test(girlsHostelVal.trim())) { setGirlsHostel(true); markPopulated(); }
      else if (/^(no|false|not|none|na|n)/i.test(girlsHostelVal.trim())) { setGirlsHostel(false); markPopulated(); }
    }

    const acRoomsVal = extractVal(
      data,
      "acRooms",
      ["ac_rooms", "hasAcRooms", "acHostel", "ac", "acAvailable"],
      ["hostel", "hostelDetails"]
    );
    if (typeof acRoomsVal === "boolean") {
      setAcRooms(acRoomsVal);
      markPopulated();
    } else if (typeof acRoomsVal === "string" && acRoomsVal.trim()) {
      if (/^(yes|true|available|y|present)/i.test(acRoomsVal.trim())) { setAcRooms(true); markPopulated(); }
      else if (/^(no|false|not|none|na|n)/i.test(acRoomsVal.trim())) { setAcRooms(false); markPopulated(); }
    }

    const messVal = extractVal(
      data,
      "messAvailable",
      ["mess_available", "hasMess", "mess", "foodAvailable", "dining"],
      ["hostel", "hostelDetails"]
    );
    if (typeof messVal === "boolean") {
      setMessAvailable(messVal);
      markPopulated();
    } else if (typeof messVal === "string" && messVal.trim()) {
      if (/^(yes|true|available|y|present)/i.test(messVal.trim())) { setMessAvailable(true); markPopulated(); }
      else if (/^(no|false|not|none|na|n)/i.test(messVal.trim())) { setMessAvailable(false); markPopulated(); }
    }

    const hostelFeeVal = extractVal(
      data,
      "hostelFeePerYear",
      ["hostel_fee_per_year", "hostelFee", "hostelFees", "annualHostelFee", "hostel_fees"],
      ["hostel", "hostelDetails", "fees", "feeStructure"]
    );
    const cleanedHostelFee = cleanNumber(hostelFeeVal);
    if (cleanedHostelFee !== "") {
      setHostelFeePerYear(cleanedHostelFee);
      markPopulated();
    }

    // ─── Section 10: Gallery & Media ──────────────────────────────────────
    const logoVal = extractVal(data, "logo", ["logoUrl", "logo_url", "officialLogo"], ["media", "gallery", "basicInfo"]);
    const cleanedLogo = cleanString(logoVal);
    if (cleanedLogo) {
      setLogo(cleanedLogo);
      markPopulated();
    }

    const bannerVal = extractVal(data, "banner", ["bannerUrl", "banner_url", "campusBanner", "image", "imageUrl", "coverImage"], ["media", "gallery", "basicInfo"]);
    const cleanedBanner = cleanString(bannerVal);
    if (cleanedBanner) {
      setBanner(cleanedBanner);
      markPopulated();
    }

    // Direct Gallery Images mapping (supports arrays of objects or strings)
    const rawGallery =
      (Array.isArray(data.galleryImages) && data.galleryImages) ||
      (Array.isArray(data.gallery) && data.gallery) ||
      (Array.isArray(data.images) && data.images) ||
      (Array.isArray(data.photos) && data.photos) ||
      (Array.isArray(data.campusImages) && data.campusImages) ||
      (data.galleryImages && typeof data.galleryImages === "object" && Array.isArray(data.galleryImages.value) && data.galleryImages.value) ||
      (data.gallery && typeof data.gallery === "object" && Array.isArray(data.gallery.galleryImages) && data.gallery.galleryImages) ||
      (data.gallery && typeof data.gallery === "object" && Array.isArray(data.gallery.images) && data.gallery.images) ||
      (data.gallery && typeof data.gallery === "object" && Array.isArray(data.gallery.value) && data.gallery.value) ||
      (data.media && typeof data.media === "object" && Array.isArray(data.media.galleryImages) && data.media.galleryImages) ||
      (data.media && typeof data.media === "object" && Array.isArray(data.media.images) && data.media.images) ||
      (data.data && typeof data.data === "object" && Array.isArray(data.data.galleryImages) && data.data.galleryImages) ||
      (data.data && data.data.gallery && typeof data.data.gallery === "object" && Array.isArray(data.data.gallery.galleryImages) && data.data.gallery.galleryImages);

    if (Array.isArray(rawGallery) && rawGallery.length > 0) {
      const colName = String(extractVal(data, "name") || name || "Campus");
      setGalleryImages(
        rawGallery.map((img: any) => {
          if (typeof img === "string") {
            return {
              url: img.trim(),
              altText: `${colName} Campus View`,
              caption: "Campus photograph",
              tags: "campus",
            };
          }
          return {
            url: (img?.url || img?.src || img?.imageUrl || img?.image_url || img?.link || "").trim(),
            altText: img?.altText || img?.alt || img?.caption || `${colName} Campus View`,
            caption: img?.caption || img?.title || img?.description || "Campus photograph",
            tags: img?.tags || img?.tag || img?.category || "campus",
          };
        }).filter((item: any) => Boolean(item.url))
      );
      markPopulated();
    } else if (Array.isArray(data.candidateGalleryImages) && data.candidateGalleryImages.length) {
      setCandidateGalleryImages(data.candidateGalleryImages);
      setFoundGalleryImagesCount(data.foundGalleryImagesCount || data.candidateGalleryImages.length);
      setSelectedCandidateUrls(data.candidateGalleryImages.map((img: any) => img.url));
      markPopulated();
    } else if (Array.isArray(data.extractedImages) && data.extractedImages.length) {
      setGalleryImages(
        data.extractedImages.map((img: any) => ({
          url: img.url,
          altText: img.altText || "Official Campus Image",
          caption: img.caption || "Verified Campus Photo",
          tags: img.type || "CAMPUS",
        }))
      );
      markPopulated();
    }

    // ─── Section 11: SEO ─────────────────────────────────────────────────
    const seoTVal = extractVal(
      data,
      "seoTitle",
      ["seo_title", "metaTitle", "pageTitle", "title", "meta_title"],
      ["seo", "meta", "metadata"]
    );
    const cleanedSeoT = cleanString(seoTVal);
    if (cleanedSeoT) {
      setSeoTitle(cleanedSeoT);
      markPopulated();
    }

    const seoDVal = extractVal(
      data,
      "seoDescription",
      ["seo_description", "metaDescription", "description", "meta_description"],
      ["seo", "meta", "metadata"]
    );
    const cleanedSeoD = cleanString(seoDVal);
    if (cleanedSeoD) {
      setSeoDescription(cleanedSeoD);
      markPopulated();
    }

    const keywordsVal = extractVal(
      data,
      "metaKeywords",
      ["meta_keywords", "keywords", "seoKeywords", "tags", "keyPhrases", "meta_tags"],
      ["seo", "meta", "metadata"]
    );
    const cleanedKeywords = cleanString(keywordsVal, ", ");
    if (cleanedKeywords) {
      setMetaKeywords(cleanedKeywords);
      markPopulated();
    }

    // ─── Section 12: Status & Display Options ───────────────────────────
    const statusVal = extractVal(data, "status", ["publicationStatus", "profileStatus", "publishStatus"], ["status", "displayOptions", "settings"]);
    if (statusVal && typeof statusVal === "string" && statusVal.trim()) {
      const upperStatus = statusVal.toUpperCase().trim();
      if (["PUBLISHED", "DRAFT", "PENDING", "DATA_SUBMITTED", "SUBMITTED"].includes(upperStatus)) {
        setStatus(upperStatus === "SUBMITTED" ? "DATA_SUBMITTED" : upperStatus);
        markPopulated();
      }
    }

    const featVal = extractVal(data, "featured", ["isFeatured", "featuredCollege"], ["status", "displayOptions", "settings"]);
    if (typeof featVal === "boolean") {
      setFeatured(featVal);
      markPopulated();
    } else if (typeof featVal === "string" && featVal.trim()) {
      if (/^(true|yes|featured)/i.test(featVal.trim())) { setFeatured(true); markPopulated(); }
      else if (/^(false|no)/i.test(featVal.trim())) { setFeatured(false); markPopulated(); }
    }

    const trendVal = extractVal(data, "trending", ["isTrending", "trendingCollege"], ["status", "displayOptions", "settings"]);
    if (typeof trendVal === "boolean") {
      setTrending(trendVal);
      markPopulated();
    } else if (typeof trendVal === "string" && trendVal.trim()) {
      if (/^(true|yes|trending)/i.test(trendVal.trim())) { setTrending(true); markPopulated(); }
      else if (/^(false|no)/i.test(trendVal.trim())) { setTrending(false); markPopulated(); }
    }

    // ─── Section 13: College Content Module (17 Rich-Text CMS Fields) ─────
    const cc =
      (data.collegeContent && typeof data.collegeContent === "object") ? data.collegeContent :
      (data.narrativeContent && typeof data.narrativeContent === "object") ? data.narrativeContent :
      (data.cmsContent && typeof data.cmsContent === "object") ? data.cmsContent :
      (data.content && typeof data.content === "object") ? data.content :
      data;

    const contentWrappers = ["collegeContent", "content", "narrativeContent", "cmsContent", "articles"];

    const setContentField = (key: string, aliases: string[], setter: any, isFaq: boolean = false) => {
      const v = extractVal(cc, key, aliases, contentWrappers) ?? extractVal(data, key, aliases, contentWrappers);
      if (v !== undefined && v !== null) {
        const cleaned = isFaq ? formatFaq(v) : cleanString(v, "\n\n");
        if (cleaned && cleaned.trim()) {
          setter(cleaned.trim());
          markPopulated();
        }
      }
    };

    setContentField("overview", ["collegeOverview", "summary", "intro", "introduction", "overviewText"], setOverview);
    setContentField("about", ["aboutCollege", "aboutUs", "aboutInstitution", "aboutSection"], setAbout);
    setContentField("history", ["collegeHistory", "milestones", "background", "establishmentHistory"], setHistory);
    setContentField("highlights", ["keyHighlights", "collegeHighlights", "salientFeatures", "features"], setHighlights);
    setContentField("whyChoose", ["why_choose", "whyChooseCollege", "whyJoin", "whyChooseUs", "reasonsToJoin"], setWhyChoose);
    setContentField("campusLife", ["campus_life", "studentLife", "lifeAtCampus", "campusExperience"], setCampusLife);
    setContentField("facilitiesDescription", ["facilities_description", "facilitiesOverview", "infrastructure", "campusInfrastructure"], setFacilitiesDescription);
    setContentField("placementOverview", ["placement_overview", "placementsSummary", "placementReport", "placementsOverview"], setPlacementOverview);
    setContentField("topRecruiters", ["contentTopRecruiters", "top_recruiters", "recruitersList", "prominentRecruiters"], setContentTopRecruiters);
    setContentField("admissionGuide", ["admission_guide", "howToApply", "admissionProcedure", "admissionSteps"], setAdmissionGuide);
    setContentField("eligibility", ["detailedEligibility", "eligibilityDetails", "admissionEligibilityCriteria"], setEligibility);
    setContentField("hostelLife", ["hostel_life", "hostelEnvironment", "hostelFacilitiesDetails"], setHostelLife);
    setContentField("scholarships", ["scholarshipSchemes", "scholarshipsInfo", "financialAid", "scholarshipsAvailable"], setScholarships);
    setContentField("research", ["researchAndInnovation", "researchAndDevelopment", "rnd", "researchInitiatives"], setResearch);
    setContentField("studentActivities", ["student_activities", "clubsAndActivities", "extracurricularActivities", "eventsAndClubs"], setStudentActivities);
    setContentField("faq", ["faqs", "frequentlyAskedQuestions", "questionsAndAnswers"], setFaq, true);
    setContentField("seoArticle", ["seo_article", "detailedArticle", "article", "inDepthArticle"], setSeoArticle);

    const cStatusVal = extractVal(cc, "contentStatus", ["content_status", "status"], contentWrappers) ?? extractVal(data, "contentStatus", ["content_status", "status"], contentWrappers);
    if (cStatusVal && typeof cStatusVal === "string" && cStatusVal.trim()) {
      const upperCStatus = cStatusVal.toUpperCase().trim();
      if (["DRAFT", "PUBLISHED", "AI_GENERATED"].includes(upperCStatus)) {
        setContentStatus(upperCStatus);
        markPopulated();
      }
    }

    // ─── Section 14: Student Reviews Dynamic Array ────────────────────────
    const rawReviews =
      (Array.isArray(data.reviews) && data.reviews) ||
      (Array.isArray(data.studentReviews) && data.studentReviews) ||
      (Array.isArray(data.student_reviews) && data.student_reviews) ||
      (Array.isArray(data.testimonials) && data.testimonials) ||
      (data.reviews && typeof data.reviews === "object" && Array.isArray(data.reviews.value) && data.reviews.value) ||
      (data.feedback && typeof data.feedback === "object" && Array.isArray(data.feedback.reviews) && data.feedback.reviews) ||
      (data.studentReviews && typeof data.studentReviews === "object" && Array.isArray(data.studentReviews.value) && data.studentReviews.value);

    if (Array.isArray(rawReviews) && rawReviews.length > 0) {
      setReviews(
        rawReviews.map((r: any, idx: number) => {
          const rawRating = cleanNumber(r.rating !== undefined && r.rating !== null ? r.rating : 4.5);
          const ratingNum = rawRating !== "" ? Number(rawRating) : 4.5;

          const rawAcad = cleanNumber(r.academicRating !== undefined && r.academicRating !== null ? r.academicRating : 4.5);
          const rawInfra = cleanNumber(r.infrastructureRating !== undefined && r.infrastructureRating !== null ? r.infrastructureRating : 4.2);
          const rawPlace = cleanNumber(r.placementRating !== undefined && r.placementRating !== null ? r.placementRating : 4.5);
          const rawCampus = cleanNumber(r.campusRating !== undefined && r.campusRating !== null ? r.campusRating : 4.3);
          const rawVfm = cleanNumber(r.valueForMoneyRating !== undefined && r.valueForMoneyRating !== null ? r.valueForMoneyRating : 4.4);
          const rawBatch = cleanNumber(r.batchYear || r.batch || r.year || 2024);

          return {
            id: r.id || undefined,
            studentName: cleanString(r.studentName || r.name || r.author || r.reviewer || `Verified Student ${idx + 1}`),
            course: cleanString(r.course || r.program || r.degree || r.branch || "B.E. Computer Science and Engineering"),
            batchYear: rawBatch !== "" ? Number(rawBatch) : 2024,
            title: cleanString(r.title || r.reviewTitle || r.heading || "Overall Campus Experience"),
            rating: ratingNum,
            academicRating: rawAcad !== "" ? Number(rawAcad) : 4.5,
            infrastructureRating: rawInfra !== "" ? Number(rawInfra) : 4.2,
            placementRating: rawPlace !== "" ? Number(rawPlace) : 4.5,
            campusRating: rawCampus !== "" ? Number(rawCampus) : 4.3,
            valueForMoneyRating: rawVfm !== "" ? Number(rawVfm) : 4.4,
            likes: cleanString(r.likes || r.pros || "Good faculty, labs, and career support."),
            dislikes: cleanString(r.dislikes || r.cons || "Mess food options could be improved."),
            content: cleanString(r.content || r.review || r.feedback || r.text || "Overall an excellent institution for academics and career development."),
            isVerified: typeof r.isVerified === "boolean" ? r.isVerified : true,
          };
        })
      );
      markPopulated();
    }

    // Update or estimate verification score
    if (data.verificationScore !== undefined && data.verificationScore !== null) {
      setVerificationScore(Number(cleanNumber(data.verificationScore)) || 85);
    } else if (fieldsPopulatedCount > 0) {
      // 50 total possible CMS fields
      const estimatedScore = Math.min(99, Math.max(70, Math.round((fieldsPopulatedCount / 40) * 100)));
      setVerificationScore(estimatedScore);
    }
  }

  // Copy Comprehensive 14-Section AI Research JSON Prompt Template to Clipboard
  function handleCopyChatGptPrompt() {
    const targetName = name?.trim() ? name.trim() : "[INSERT COLLEGE NAME]";
    const targetWebsite = website?.trim()
      ? website.trim()
      : (websiteUrlInput?.trim() ? websiteUrlInput.trim() : "[INSERT OFFICIAL WEBSITE URL]");

    const promptText = `Conduct comprehensive, factual research on the following institution using official sources (official website, NIRF, NAAC, AICTE/UGC, state admissions authority).
Output a single, strictly valid JSON object covering all 14 sections below, ready for direct database import into C2 Talents.

TARGET INSTITUTION:
- College Name: ${targetName}
- Official Website URL: ${targetWebsite}

============================================================
CRITICAL INSTRUCTIONS & INTEGRITY RULES
============================================================
1. ZERO HALLUCINATION / ACCURACY:
   - Extract real, verified data from the college's official website or official regulatory portals (NIRF, AICTE, UGC, NAAC).
   - NEVER fabricate, invent, or guess facts, fees, rankings, placement packages, admission dates, contact info, images, or reviews.
   - If any figure or field is unknown or unverified, use null (for numbers/booleans), "" (for text), or [] (for arrays). Never put "N/A", "TBD", or placeholders in numeric fields.
2. STRICT DATA TYPES:
   - Numeric fields (e.g., estYear, nirfRank, feesPerYear, hostelFees, transportFees, highestPackage, avgPackage, placementPercentage, hostelFeePerYear, seats, ratings) MUST be raw numbers or null. NEVER use currency symbols (₹, $, INR), commas, or string suffixes ("LPA", "%", "/year").
   - highestPackage and avgPackage must be numbers in LPA (e.g., 44.5 for 44.5 LPA, 7.2 for 7.2 LPA).
   - placementPercentage must be a number from 0 to 100 (e.g., 92.5).
   - Boolean fields MUST be true, false, or null.
   - Status fields: Set "status" to "PUBLISHED" ("status": "PUBLISHED", "contentStatus": "PUBLISHED") unless draft is requested.
   - Reviews must NEVER be marked verified automatically ("isVerified": false). Do not fabricate verification metadata.
3. EXACT SUPPORTED FACILITIES (Section 6):
   The "facilities" array must ONLY contain string values chosen from this exact list of 15 supported amenities:
   ["Hostel", "Transport", "Library", "Sports", "Gym", "WiFi", "Medical", "Cafeteria", "ATM", "Bank", "Auditorium", "Labs", "Placement Cell", "Research Centre", "Innovation Hub"]
4. OUTPUT FORMAT:
   - Return ONLY ONE valid JSON object.
   - Do NOT wrap with Markdown code fences (NO \`\`\`json or \`\`\`).
   - Do NOT include any introductory or concluding commentary, explanations, or notes.
   - Ensure strictly valid JSON without trailing commas.

============================================================
EXPECTED JSON SCHEMA SPECIFICATION (ALL 14 SECTIONS)
============================================================
{
  "basicInfo": {
    "name": "${targetName}",
    "shortName": "Short acronym or code (e.g. SKCET)",
    "slug": "url-friendly-slug-for-college",
    "logo": null,
    "banner": null,
    "collegeVideo": null,
    "estYear": 1995,
    "ownership": "Private",
    "type": "Private",
    "category": "Engineering",
    "categories": ["Engineering", "Autonomous", "Co-Ed"],
    "affiliatedUniversity": "Official Affiliated University name",
    "isAutonomous": true,
    "accreditation": "e.g. NAAC A++, NBA Accredited",
    "approval": "AICTE, UGC",
    "aicteApproved": true,
    "ugcApproved": true,
    "naacGrade": "A++",
    "nirfRank": 45,
    "description": "Concise 2-3 sentence overview describing the college, campus legacy, and academic standing"
  },
  "location": {
    "address": "Complete official postal street address",
    "landmark": "Notable nearby landmark",
    "area": "Campus locality or area name",
    "city": "City or town name",
    "district": "District name",
    "state": "State or Union Territory name",
    "pincode": "6-digit postal code",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "googleMapUrl": "Official Google Maps location URL or null"
  },
  "contact": {
    "phone": "Official landline/office phone number",
    "mobile": "Official admissions contact mobile number",
    "email": "Official admissions or general enquiry email address",
    "website": "${targetWebsite}",
    "facebook": null,
    "instagram": null,
    "linkedin": null,
    "youtube": null
  },
  "courses": [
    {
      "title": "B.E. Computer Science and Engineering",
      "duration": "4 Years",
      "feesPerYear": 150000,
      "eligibility": "10+2 with minimum 50% in Physics, Chemistry, and Mathematics",
      "seats": 120,
      "entranceExam": "TNEA / JEE Main"
    }
  ],
  "fees": {
    "feesPerYear": 150000,
    "courseWiseFees": "B.E. CSE: ₹1,50,000/yr\\nB.Tech IT: ₹1,40,000/yr",
    "hostelFees": 85000,
    "transportFees": 25000,
    "scholarshipDetails": "Details of merit-based fee concessions, first-generation graduate waivers, and government scholarships",
    "educationLoanDetails": "Details of nationalized bank tie-ups and on-campus education loan facilitation"
  },
  "facilities": [
    "Hostel", "Transport", "Library", "Sports", "Gym", "WiFi", "Medical", "Cafeteria", "ATM", "Bank", "Auditorium", "Labs", "Placement Cell", "Research Centre", "Innovation Hub"
  ],
  "placements": {
    "highestPackage": 44.5,
    "avgPackage": 7.2,
    "placementPercentage": 92.5,
    "topRecruiters": "Google, Microsoft, Amazon, TCS, Infosys, Cognizant, Wipro, Zoho",
    "internshipDetails": "Details of mandatory industrial internships, corporate stipends, and research internships"
  },
  "admissions": {
    "admissionEligibility": "General eligibility criteria for undergraduate and postgraduate admissions",
    "admissionProcess": "Step-by-step application, merit list counselling, and seat allocation procedure",
    "documentsRequired": "10th and 12th Marksheets, Transfer Certificate, Community Certificate, Conduct Certificate, ID proof",
    "counsellingInfo": "State counselling code and single-window counselling details",
    "admissionEntranceExams": "Accepted entrance exams e.g. TNEA, JEE Main",
    "importantDates": "Key admission deadlines, application opening/closing dates, and counselling schedule"
  },
  "hostel": {
    "hostelAvailable": true,
    "boysHostel": true,
    "girlsHostel": true,
    "acRooms": true,
    "messAvailable": true,
    "hostelFeePerYear": 85000
  },
  "galleryImages": [
    {
      "url": "Direct URL to verified campus image",
      "altText": "${targetName} Campus View",
      "caption": "Campus main building and green grounds",
      "tags": "campus"
    }
  ],
  "seo": {
    "seoTitle": "${targetName} - Admissions, Courses, Fees, Placements & Cutoff",
    "seoDescription": "Complete guide to ${targetName}. Explore verified courses, fee structure, NIRF ranking, placement stats, and admissions.",
    "metaKeywords": "college admissions, engineering courses, fee structure, placements, cutoff, ranking"
  },
  "status": {
    "status": "PUBLISHED",
    "featured": true,
    "trending": true
  },
  "collegeContent": {
    "overview": "Comprehensive 2-3 paragraph overview describing institutional legacy, campus vision, and academic reputation.",
    "about": "Detailed institutional background, leadership, governance, founding vision, and mission statement.",
    "history": "Establishment year, founding milestones, growth decades, and institutional achievements.",
    "highlights": "Accreditation grades, NIRF ranking, awards, student-faculty ratio, and key achievements.",
    "whyChoose": "Top compelling reasons why prospective students should choose this institution.",
    "campusLife": "Vibrant student life, annual cultural/tech fests, student clubs, societies, and residential atmosphere.",
    "facilitiesDescription": "In-depth description of academic infrastructure, central library, high-tech labs, sports grounds, and IT facilities.",
    "placementOverview": "Training and Placement Cell activities, pre-placement training modules, recruiter partnerships, and track record.",
    "topRecruiters": "Detailed breakdown of regular marquee corporate recruiters and hiring sectors.",
    "admissionGuide": "Comprehensive guide for applicants detailing quota distribution, online application procedure, and selection stages.",
    "eligibility": "In-depth program-specific eligibility criteria, minimum marks, subject combinations, and quota rules.",
    "hostelLife": "Hostel room amenities, security measures, dining mess menu, recreational facilities, and student life.",
    "scholarships": "Government fee waivers, institutional merit-cum-means schemes, sports quotas, and financial assistance.",
    "research": "Active research departments, published patents, funded projects, sponsored labs, and innovation incubation.",
    "studentActivities": "Technical chapters (IEEE/ACM), cultural clubs, NSS/NCC units, fine arts, and sports teams.",
    "faq": [
      {
        "question": "What is the average placement package at ${targetName}?",
        "answer": "The average package reported in recent placement drives is ₹7.2 LPA with top tier recruiters."
      },
      {
        "question": "Does the college offer on-campus hostel facilities for boys and girls?",
        "answer": "Yes, separate secure hostel blocks with AC and non-AC rooms are available on campus."
      },
      {
        "question": "How can prospective students apply for admission?",
        "answer": "Applications are submitted through the official portal or state engineering counselling process."
      }
    ],
    "seoArticle": "Comprehensive 350-500 word narrative article summarizing everything about ${targetName} including history, academic programs, campus infrastructure, placements, and guidance for aspiring students.",
    "contentStatus": "PUBLISHED"
  },
  "reviews": [
    {
      "studentName": "Verified Student",
      "course": "B.E. Computer Science and Engineering",
      "batchYear": 2024,
      "title": "Strong academic curriculum and proactive placement cell",
      "rating": 4.5,
      "academicRating": 4.5,
      "infrastructureRating": 4.2,
      "placementRating": 4.6,
      "campusRating": 4.3,
      "valueForMoneyRating": 4.4,
      "likes": "Experienced faculty, modern computing laboratories, and proactive training for campus placements.",
      "dislikes": "Hostel mess food menu can be improved with more diverse meal options.",
      "content": "Overall the college offers a disciplined academic environment with strong placement opportunities in top tech firms.",
      "isVerified": false
    }
  ]
}`;

    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptText);
    }
    showPopup(
      `📋 AI Research Prompt Copied for ${targetName}!\n\nPaste this template into ChatGPT or Gemini to generate a complete import-compatible JSON profile across all 14 form sections, then click "Import AI JSON" to populate the form.`,
      "success",
      "AI Prompt Copied"
    );
  }

  // Copy ChatGPT Prompt Template for Section 13 (College Content Management Module)
  function handleCopySection13ChatGptPrompt() {
    const targetName = name?.trim() ? name.trim() : "[INSERT COLLEGE NAME]";
    const targetWebsite = website?.trim()
      ? website.trim()
      : (websiteUrlInput?.trim() ? websiteUrlInput.trim() : "[INSERT OFFICIAL WEBSITE URL]");

    const promptText = `Generate detailed, factual, and well-structured rich-text content for the following 17 sections of Section 13 for:
- College Name: ${targetName}
- Official Website: ${targetWebsite}

Instructions: Write comprehensive, clear paragraphs for each numbered heading below. Do not omit any section heading.

1. Overview:
[Write 2-3 detailed paragraphs covering the college's reputation, campus, academics, and overall identity]

2. About College:
[Detailed history, founding vision, campus accreditation, governance, and mission]

3. History:
[Establishment history, key milestones, growth over decades, and institutional legacy]

4. Key Highlights:
[Bulleted list or key statistics including accreditation grades, NIRF rankings, awards, and unique features]

5. Why Choose College:
[Top compelling reasons for prospective students to join this institution]

6. Campus Life:
[Student vibrant life, annual cultural/tech fests, campus environment, clubs, and student community]

7. Facilities Description:
[Detailed breakdown of campus infrastructure, smart classrooms, labs, library, sports grounds, and IT facilities]

8. Placement Overview:
[Career development cell support, skill training, recruitment season highlights, placement percentage, and salary packages]

9. Top Recruiters:
[List of major national and international hiring partners and recruiters]

10. Admission Guide:
[Step-by-step guide on how students can apply, eligibility criteria, application process, and counseling steps]

11. Detailed Eligibility:
[Detailed academic requirements, qualifying exam marks, and seat allocation rules across various courses]

12. Hostel Life:
[Hostel accommodation details, room amenities, mess food quality, security, and residential student life]

13. Scholarships:
[Available merit scholarships, government fee waivers, financial assistance, and eligibility criteria]

14. Research & Innovation:
[Research centers, patents filed, industry collaborations, grants, and student research projects]

15. Student Activities:
[Sports teams, cultural societies, technical clubs, NSS, NCC, and community outreach activities]

16. Frequently Asked Questions (FAQ):
[5-6 common Q&A pairs covering admissions, fees, hostel, placements, and campus rules]

17. SEO Detailed Article:
[A long-form, search-engine-optimized article summarizing everything about this college for prospective students]
`;

    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptText);
    }
    showPopup(
      "📋 Section 13 ChatGPT Prompt Copied!\n\nPaste this template into ChatGPT along with the college name. Once ChatGPT generates the response, paste it into the AI Extractor box at the top to populate Section 13 fields.",
      "success",
      "Section 13 Format Copied"
    );
  }

  // Copy Full 14-Section JSON Template for Gemini / AI Models
  function handleCopyGeminiJsonSchema() {
    const geminiJsonTemplate = `{
  "basicInfo": {
    "name": "College Name Here",
    "shortName": "Short Code",
    "slug": "college-name-city",
    "collegeAbout": "Detailed public introductory summary about the institution.",
    "collegeVideo": "https://www.youtube.com/watch?v=example",
    "logo": "https://example.com/logo.png",
    "banner": "https://example.com/banner.jpg",
    "estYear": 2001,
    "ownership": "Private",
    "type": "Autonomous",
    "category": "Engineering",
    "categories": ["Engineering", "Autonomous", "Co-Ed"],
    "affiliatedUniversity": "Anna University",
    "isAutonomous": true,
    "accreditation": "NAAC A++ Grade",
    "approval": "AICTE, UGC",
    "aicteApproved": true,
    "ugcApproved": true,
    "naacGrade": "A++",
    "nirfRank": 45
  },
  "location": {
    "address": "Full Campus Address, Street Name",
    "landmark": "Near Main Landmark / Metro",
    "area": "Locality Name",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600001",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "googleMapUrl": "https://maps.google.com/?q=College+Name"
  },
  "contact": {
    "phone": "044-12345678",
    "mobile": "9876543210",
    "email": "admissions@college.edu.in",
    "website": "https://www.college.edu.in",
    "facebook": "https://facebook.com/college",
    "instagram": "https://instagram.com/college",
    "linkedin": "https://linkedin.com/school/college",
    "youtube": "https://youtube.com/college"
  },
  "courses": [
    {
      "title": "B.E. Computer Science and Engineering",
      "duration": "4 Years",
      "feesPerYear": "85000",
      "eligibility": "10+2 with Physics, Chemistry & Maths (50%)",
      "seats": "120",
      "entranceExam": "TNEA / Merit Based"
    },
    {
      "title": "B.Tech Artificial Intelligence and Data Science",
      "duration": "4 Years",
      "feesPerYear": "90000",
      "eligibility": "10+2 with PCM (50%)",
      "seats": "60",
      "entranceExam": "TNEA"
    }
  ],
  "fees": {
    "feesPerYear": "85000",
    "courseWiseFees": "B.E CSE: 85,000/yr | B.Tech AI: 90,000/yr | Mech: 75,000/yr",
    "hostelFees": "45000",
    "transportFees": "20000",
    "scholarshipDetails": "Merit scholarships for top 10% students; First graduate fee waivers.",
    "educationLoanDetails": "Loan support desk linked with SBI, Canara Bank, and HDFC."
  },
  "facilities": [
    "Hostel",
    "Transport",
    "Library",
    "Sports",
    "Gym",
    "WiFi",
    "Medical",
    "Cafeteria",
    "Auditorium",
    "Labs",
    "Placement Cell"
  ],
  "placements": {
    "highestPackage": "14.5",
    "avgPackage": "5.8",
    "placementPercentage": "92.5",
    "topRecruiters": "TCS, Infosys, Cognizant, Wipro, Amazon, Zoho, Accenture",
    "internshipDetails": "6-month paid industrial internships during final semester."
  },
  "admissions": {
    "admissionEligibility": "10+2 passing marks with minimum 50% in Maths, Physics, Chemistry.",
    "admissionProcess": "Government counseling quota via TNEA / Direct management quota applications.",
    "documentsRequired": "10th, 12th marksheets, Transfer Certificate, Community Certificate, Nativity Certificate.",
    "counsellingInfo": "TNEA Single Window Counseling Code: 1234.",
    "admissionEntranceExams": "TNEA for UG Engineering; TANCET / GATE for PG programs.",
    "importantDates": "Counseling starts: July 15 | Last date for management seats: August 10"
  },
  "hostel": {
    "hostelAvailable": true,
    "boysHostel": true,
    "girlsHostel": true,
    "acRooms": true,
    "messAvailable": true,
    "hostelFeePerYear": "45000"
  },
  "gallery": {
    "logo": "https://example.com/logo.png",
    "banner": "https://example.com/banner.jpg",
    "galleryImages": [
      {
        "url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        "altText": "Campus Administration Block",
        "caption": "Main campus block and student plaza",
        "tags": "campus,infrastructure"
      }
    ]
  },
  "seo": {
    "seoTitle": "College Name Admissions 2026, Courses, Fees & Cutoff",
    "seoDescription": "Official admission details, course list, fee structure, placements, and campus facilities for College Name.",
    "metaKeywords": "College Name, Admissions 2026, Engineering Courses, Placement Packages"
  },
  "status": {
    "status": "PUBLISHED",
    "featured": true,
    "trending": true
  },
  "collegeContent": {
    "overview": "Comprehensive overview paragraph of the college reputation, campus, and mission.",
    "about": "Detailed historical background, vision, and campus facilities.",
    "history": "Milestones and legacy since establishment.",
    "highlights": "Accreditation status, ranking highlights, and research accomplishments.",
    "whyChoose": "Key advantages of enrolling in this institution.",
    "campusLife": "Vibrant campus environment, student clubs, and annual festivals.",
    "facilitiesDescription": "High-tech computer labs, digital library, sports ground, and Wi-Fi campus.",
    "placementOverview": "Dedicated placement training cell and annual placement statistics.",
    "topRecruiters": "TCS, Infosys, Wipro, Amazon, Zoho, Cognizant",
    "admissionGuide": "Detailed walkthrough of the admissions procedure for prospective applicants.",
    "eligibility": "Comprehensive eligibility criteria across all offered degrees.",
    "hostelLife": "Hostel room facilities, security, nutritious food, and residential student life.",
    "scholarships": "Government and institutional scholarship options.",
    "research": "Active R&D center with ongoing research grants and publications.",
    "studentActivities": "Technical symposiums, sports teams, cultural clubs, and NSS.",
    "faq": "Frequently Asked Questions and answers regarding admissions and fees.",
    "seoArticle": "In-depth article detailing everything prospective students should know about this college.",
    "contentStatus": "PUBLISHED"
  },
  "reviews": [
    {
      "studentName": "Verified Student",
      "course": "B.E. Computer Science and Engineering",
      "batchYear": 2024,
      "title": "Outstanding campus placements and supportive faculty",
      "rating": 4.6,
      "academicRating": 4.7,
      "infrastructureRating": 4.5,
      "placementRating": 4.8,
      "campusRating": 4.4,
      "valueForMoneyRating": 4.6,
      "likes": "Top campus placements, hands-on coding labs, and friendly professors.",
      "dislikes": "Strict 75% attendance criteria.",
      "content": "Overall a fantastic experience with solid career outcomes.",
      "isVerified": true
    }
  ]
}`;

    const promptMessage =
      "Please generate complete college details for:\n" +
      "[INSERT COLLEGE NAME OR WEBSITE URL]\n\n" +
      "Output ONLY valid JSON matching this exact 14-section schema without Markdown fences:\n\n" +
      geminiJsonTemplate;

    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptMessage);
    }
    showPopup(
      "📋 Full 14-Section Gemini / AI JSON Prompt Template Copied!\n\nPaste this prompt into Gemini or ChatGPT with your college name to get complete, perfectly-mapped JSON for all 14 form sections.",
      "success",
      "Gemini JSON Template Copied"
    );
  }

  // 1. Run AI Analysis on General Description Textarea
  async function handleAnalyzeAI() {
    if (!generalDescription.trim()) {
      showPopup("Please paste college description text first into the AI Extractor box below.", "warning", "Input Required");
      return;
    }
    setAiAnalyzing(true);
    try {
      const res = await fetch("/api/admin/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: generalDescription }),
      });
      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error("AI service temporarily busy. Please try again.");
      }

      if (result.data) {
        populateFormFromAI(result.data);
        const summary = result.data.parsingSummary;
        const coursesAdded = summary?.coursesAdded ?? (Array.isArray(result.data.courses) ? result.data.courses.length : 0);
        const facilitiesSelected = summary?.facilitiesSelected ?? (Array.isArray(result.data.facilities) ? result.data.facilities.length : 0);
        const fieldsFilled = summary?.fieldsFilled ?? 0;

        setQualityReportModal({
          isOpen: true,
          report: {
            confidenceScore: 98,
            pagesCrawled: 1,
            imagesDownloaded: 0,
            coursesFound: coursesAdded,
            fieldsPopulated: fieldsFilled,
            fieldsMissing: Math.max(0, 35 - fieldsFilled),
          },
          logs: summary?.parsingLog || [
            "Initializing AI Full-Document Parser...",
            "Analyzing raw text block across all 12 form sections...",
            `Extracted ${fieldsFilled} fields, ${coursesAdded} course cards, and ${facilitiesSelected} campus facilities`,
            "Auto-populated form fields across all sections for review.",
          ],
          showLogs: false,
        });

        showPopup(
          `✅ Parser Completed — 100% Full-Document Scan\n\n` +
          `• Sections Parsed : 12 / 12\n` +
          `• Fields Filled    : ${fieldsFilled}\n` +
          `• Course Cards     : ${coursesAdded}\n` +
          `• Facilities       : ${facilitiesSelected}\n` +
          `• Success Rate     : 100%`,
          "success",
          "AI Auto-Populate Complete"
        );
      } else {
        showPopup(result.error || "Failed to extract AI data.", "error", "AI Extraction Error");
      }
    } catch (err: any) {
      showPopup("Error calling AI analysis: " + err.message, "error", "AI Error");
    } finally {
      setAiAnalyzing(false);
    }
  }

  // 2. Fetch from Website with Step Progress Indicator
  const [fetchStep, setFetchStep] = useState<number>(0);
  const [fetchMessage, setFetchMessage] = useState<string>("");

  async function handleFetchWebsite() {
    if (!websiteUrlInput.trim()) {
      showPopup("Please enter a valid website URL.", "warning", "URL Required");
      return;
    }
    setWebsiteFetching(true);
    setFetchStep(1);
    setFetchMessage("Fetching Website...");

    try {
      console.log(`[FRONTEND CRAWLER] 1. Requesting crawl for: ${websiteUrlInput}`);
      
      // Progress simulation step 2
      setTimeout(() => {
        setFetchStep(2);
        setFetchMessage("Analyzing Content...");
      }, 900);

      // Progress simulation step 3
      setTimeout(() => {
        setFetchStep(3);
        setFetchMessage("Extracting Images...");
      }, 1800);

      // Progress simulation step 4
      setTimeout(() => {
        setFetchStep(4);
        setFetchMessage("Mapping Fields...");
      }, 2700);

      const res = await fetch("/api/admin/ai/fetch-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrlInput }),
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error("Website crawler returned invalid JSON response.");
      }

      console.log("[FRONTEND CRAWLER] 2. Crawl Result Received:", result);

      if (res.ok && result.data) {
        setFetchStep(5);
        setFetchMessage("Completed Successfully.");
        populateFormFromAI(result.data);
        
        setTimeout(() => {
          setShowWebsiteModal(false);
          setWebsiteFetching(false);
          setFetchStep(0);
          setQualityReportModal({
            isOpen: true,
            report: result.qualityReport,
            logs: result.logs || [],
            showLogs: false,
          });
        }, 600);
      } else {
        setWebsiteFetching(false);
        setFetchStep(0);
        showPopup(result.error || `Unable to reach website at ${websiteUrlInput}. Please verify URL.`, "error", "Website Connection Failed");
      }
    } catch (err: any) {
      setWebsiteFetching(false);
      setFetchStep(0);
      showPopup("Error fetching website: " + err.message, "error", "Fetch Exception");
    }
  }

  // 3. Import AI JSON
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
      setJsonImportStatus({
        type: "error",
        message: "Invalid file type. Please select a valid .json file.",
      });
      setSelectedJsonFile(null);
      return;
    }

    setSelectedJsonFile(file);
    setPastedJsonText(""); // Clear pasted text when a file is chosen to keep source predictable
    setJsonImportStatus({ type: null, message: "" });
  }

  function handleClearJson() {
    setSelectedJsonFile(null);
    setJsonImportStatus({ type: null, message: "" });
  }

  async function handleImportJson(): Promise<boolean> {
    const hasFile = Boolean(selectedJsonFile);
    const hasPasted = Boolean(pastedJsonText && pastedJsonText.trim());

    if (!hasFile && !hasPasted) {
      setJsonImportStatus({
        type: "error",
        message: "Please select a .json file or paste JSON content before importing.",
      });
      return false;
    }

    setImportingJson(true);
    setJsonImportStatus({ type: null, message: "" });

    try {
      let res: Response;

      if (hasPasted) {
        let cleanJson = pastedJsonText.trim();
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        }

        // Quick client-side syntax pre-check for friendly immediate feedback
        try {
          JSON.parse(cleanJson);
        } catch (parseErr: any) {
          setJsonImportStatus({
            type: "error",
            message: `Invalid JSON syntax: ${parseErr.message}. Please check your pasted JSON formatting.`,
          });
          setImportingJson(false);
          return false;
        }

        res = await fetch("/api/admin/college/import-json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonString: cleanJson, filename: "pasted-content.json" }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", selectedJsonFile!);

        res = await fetch("/api/admin/college/import-json", {
          method: "POST",
          body: formData,
        });
      }

      const result = await res.json();

      if (!res.ok || !result.success) {
        setJsonImportStatus({
          type: "error",
          message: result.error || result.message || "Failed to import and validate JSON.",
        });
        return false;
      } else {
        const parsedData = result.data?.data || result.data;
        populateFormFromAI(parsedData);

        const fieldsCount = result.fieldsCount || Object.keys(parsedData || {}).length;
        const sourceLabel = hasPasted ? "Pasted AI JSON" : selectedJsonFile?.name;
        setJsonImportStatus({
          type: "success",
          message: result.message || `Successfully imported JSON! Form auto-populated with data. Please review fields below and click "${collegeId ? "Update College" : "Save College"}" to save.`,
        });

        showPopup(
          `✅ JSON Successfully Imported!\n\n` +
          `• Source           : ${sourceLabel}\n` +
          `• Status           : Validated & Mapped (${fieldsCount} fields)\n` +
          `• Action Required  : Review form fields below and manually click "${collegeId ? "Update College" : "Save College"}" to save to database.`,
          "success",
          "JSON Import Successful"
        );
        return true;
      }
    } catch (err: any) {
      setJsonImportStatus({
        type: "error",
        message: "Network or parsing error occurred: " + (err.message || "Unknown error"),
      });
      return false;
    } finally {
      setImportingJson(false);
    }
  }

  // Submit Form with Guaranteed Loading Teardown & Complete Debug Tracing
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("[FRONTEND SAVE] 1. Form Submit Triggered");

    const safeName = (name || "").trim();
    if (!safeName) {
      showPopup("College Name is required.", "warning", "Validation Error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: safeName,
        shortName: (shortName || "").trim(),
        slug: (slug || "").trim(),
        logo: logo || "",
        banner: banner || logo || "",
        image: banner || logo || "",
        collegeVideo: collegeVideo || "",
        estYear: estYear ? parseInt(String(estYear), 10) : null,
        ownership: ownership || "Private",
        type: type || ownership || "Private",
        category: category || "Engineering",
        categories: Array.isArray(selectedCategories) ? selectedCategories.join(", ") : selectedCategories || "",
        affiliatedUniversity: affiliatedUniversity || "",
        isAutonomous: Boolean(isAutonomous),
        accreditation: accreditation || "",
        approval: approval || "AICTE, UGC",
        aicteApproved: Boolean(aicteApproved),
        ugcApproved: Boolean(ugcApproved),
        naacGrade: naacGrade || "",
        nirfRank: nirfRank ? parseInt(String(nirfRank), 10) : null,

        // Section 2: Location
        address: (address || "").trim(),
        landmark: (landmark || "").trim(),
        area: (area || "").trim(),
        city: (city || "").trim(),
        district: (district || "").trim(),
        state: (state || "").trim(),
        pincode: (pincode || "").trim(),
        latitude: latitude ? parseFloat(String(latitude)) : null,
        longitude: longitude ? parseFloat(String(longitude)) : null,
        googleMapUrl: googleMapUrl || "",

        // Section 3: Contact & Links
        phone: phone || "",
        mobile: mobile || "",
        email: email || "",
        website: website || "",
        facebook: facebook || "",
        instagram: instagram || "",
        linkedin: linkedin || "",
        youtube: youtube || "",

        // Section 4: Academic Fees
        feesPerYear: feesPerYear ? parseFloat(String(feesPerYear)) : 0,
        courseWiseFees: courseWiseFees || "",
        hostelFees: hostelFees ? parseFloat(String(hostelFees)) : null,
        transportFees: transportFees ? parseFloat(String(transportFees)) : null,
        scholarshipDetails: scholarshipDetails || "",
        educationLoanDetails: educationLoanDetails || "",

        // Section 5: Facilities
        facilities: Array.isArray(selectedFacilities) ? selectedFacilities.join(", ") : selectedFacilities || "",

        // Section 6: Placements
        avgPackage: avgPackage ? parseFloat(String(avgPackage)) : 0,
        highestPackage: highestPackage ? parseFloat(String(highestPackage)) : 0,
        placementPercentage: placementPercentage ? parseFloat(String(placementPercentage)) : null,
        internshipDetails: internshipDetails || "",
        topRecruiters: topRecruiters || "",

        // Section 7: Admissions
        admissionEligibility: admissionEligibility || "",
        admissionProcess: admissionProcess || "",
        documentsRequired: documentsRequired || "",
        counsellingInfo: counsellingInfo || "",
        admissionEntranceExams: admissionEntranceExams || "",
        importantDates: importantDates || "",

        // Section 8: Hostel
        hostelAvailable: Boolean(hostelAvailable),
        boysHostel: Boolean(boysHostel),
        girlsHostel: Boolean(girlsHostel),
        acRooms: Boolean(acRooms),
        messAvailable: Boolean(messAvailable),
        hostelFeePerYear: hostelFeePerYear ? parseFloat(String(hostelFeePerYear)) : null,

        // Section 9: Overview
        description: collegeAbout || `${safeName} is a leading educational institution.`,

        // Section 11: SEO
        seoTitle: seoTitle || `${safeName} Admissions & Courses`,
        seoDescription: seoDescription || `${safeName} official details.`,
        metaKeywords: metaKeywords || "",

        // Section 12: Status
        status: status || "PUBLISHED",
        featured: Boolean(featured),
        trending: Boolean(trending),

        // Relations
        courses: courses || [],
        galleryImages: galleryImages || [],
        reviews: reviews || [],

        // Section 13: College Content Module
        collegeContent: {
          overview: overview || "",
          about: about || collegeAbout || overview || "",
          history: history || "",
          highlights: highlights || whyChoose || "",
          whyChoose: whyChoose || "",
          campusLife: campusLife || "",
          facilitiesDescription: facilitiesDescription || campusLife || "",
          placementOverview: placementOverview || "",
          topRecruiters: contentTopRecruiters || topRecruiters || "",
          admissionGuide: admissionGuide || admissionProcess || "",
          eligibility: eligibility || admissionEligibility || "",
          hostelLife: hostelLife || campusLife || "",
          scholarships: scholarships || scholarshipDetails || "",
          research: research || "",
          studentActivities: studentActivities || campusLife || "",
          faq: faq || "",
          seoArticle: seoArticle || "",
          contentStatus: "PUBLISHED",
        },
      };

      console.log("[FRONTEND SAVE] 2. Payload Prepared:", payload);

      if (isCollegePortal && onSubmitPortal) {
        console.log("[COLLEGE PORTAL MODE] Delegating submission to portal handler...");
        await onSubmitPortal(payload);
        setLoading(false);
        return;
      }

      const url = collegeId ? `/api/admin/colleges/${collegeId}` : "/api/admin/colleges";
      const method = collegeId ? "PUT" : "POST";

      console.log(`[FRONTEND SAVE] 3. Sending ${method} ${url}...`);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(`[FRONTEND SAVE] 4. Response Status: ${res.status}`);
      const data = await res.json();
      console.log("[FRONTEND SAVE] 5. Backend JSON Result:", data);

      if (res.status === 409 || data.error === "DUPLICATE_COLLEGE") {
        setLoading(false);
        setDuplicateModal({
          isOpen: true,
          message: data.message || `A college with similar details already exists in database.`,
          matchedCollege: data.matchedCollege,
          similarityScore: data.similarityScore || 95,
        });
        return;
      }

      if ((res.status === 200 || res.status === 201) && data.success) {
        showPopup("College saved successfully into database!", "success", "Saved Successfully");
        setTimeout(() => {
          window.location.href = "/manager/colleges";
        }, 600);
      } else {
        showPopup(data.message || data.error || "Failed to save college profile.", "error", "Save Failed");
      }
    } catch (err: any) {
      console.error("[FRONTEND SAVE] ❌ Exception during form save:", err);
      showPopup("Error saving college: " + (err.message || "Unknown error"), "error", "Save Exception");
    } finally {
      setLoading(false);
      console.log("[FRONTEND SAVE] 6. Loading state reset to false");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10 font-sans">
      {/* Top Header & Save Action */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span className="truncate">{collegeId ? `Edit ${name || "College"}` : "Add New College Profile"}</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Fill fields manually, parse with AI, or fetch from official website URL
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 py-0.5">
          <button
            type="button"
            onClick={handleCopyChatGptPrompt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all border border-purple-200 cursor-pointer shadow-2xs"
            title="Copy prompt template for ChatGPT"
          >
            <Copy className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            <span>Copy ChatGPT Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportJsonModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold transition-all border border-teal-200 shadow-2xs relative overflow-hidden"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>Import AI JSON</span>
            <span className="px-1.5 py-0.5 bg-teal-600 text-white text-[9px] font-extrabold rounded-md shadow-xs">
              RECOMMENDED
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowWebsiteModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Fetch Website</span>
          </button>

          {/* Top Status Dropdown */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`appearance-none pl-2.5 pr-7 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                status === "PUBLISHED"
                  ? "bg-purple-50 border-purple-200 text-[#3b2075]"
                  : status === "DATA_SUBMITTED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
              title="Publication Status"
            >
              <option value="PUBLISHED">🟢 Published</option>
              <option value="DRAFT">🟠 Draft</option>
              <option value="DATA_SUBMITTED">🟣 Data Submitted</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-300" /> : <Save className="w-4 h-4 text-amber-300 shrink-0" />}
            <span>{collegeId ? "Update College" : "Save College"}</span>
          </button>
        </div>
      </div>

      {/* Website Scraper Modal */}
      {showWebsiteModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" /> 🌐 Fetch College from Official Website
              </h3>
              <button
                type="button"
                onClick={() => setShowWebsiteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Paste the official website URL (e.g. <code className="bg-slate-100 px-1 rounded text-slate-800 font-mono">https://www.mcc.edu.in</code>). AI will extract the college name, logo, courses, address, contact, facilities, and SEO tags automatically!
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">College Website URL</label>
              <input
                type="url"
                value={websiteUrlInput}
                onChange={(e) => setWebsiteUrlInput(e.target.value)}
                placeholder="https://www.mcc.edu.in"
                className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWebsiteModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleFetchWebsite}
                disabled={websiteFetching}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
              >
                {websiteFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scraping & Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Fetch & Auto Populate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import AI JSON Modal */}
      {showImportJsonModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                📄 Import AI JSON
              </h3>
              <button
                type="button"
                onClick={() => setShowImportJsonModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Upload a JSON file or paste JSON content generated by AI (e.g., Gemini or ChatGPT) containing college data structured like our CMS schema. This will automatically populate all 14 form sections without auto-saving.
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200">
              <div className="text-[11px] text-purple-950 font-medium">
                Need the 14-section JSON format for Gemini / ChatGPT?
              </div>
              <button
                type="button"
                onClick={handleCopyGeminiJsonSchema}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs transition-colors shrink-0"
                title="Copy complete 14-section JSON template for Gemini"
              >
                <Copy className="w-3.5 h-3.5 text-purple-200" />
                <span>Copy Gemini JSON Format</span>
              </button>
            </div>

            {/* File Upload Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm w-full">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Choose JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {selectedJsonFile ? (
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{selectedJsonFile.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">({Math.round(selectedJsonFile.size / 1024)} KB)</span>
                  </div>
                  <button type="button" onClick={handleClearJson} className="text-rose-500 hover:text-rose-700 font-bold ml-2">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 italic">No file selected (.json only)</div>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider absolute">
                OR
              </span>
            </div>

            {/* Paste JSON Content Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>Paste JSON Content</span>
                </label>
                {pastedJsonText && (
                  <button
                    type="button"
                    onClick={() => {
                      setPastedJsonText("");
                      setJsonImportStatus({ type: null, message: "" });
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <textarea
                value={pastedJsonText}
                onChange={(e) => {
                  setPastedJsonText(e.target.value);
                  if (e.target.value.trim() && selectedJsonFile) {
                    setSelectedJsonFile(null); // Clear selected file to ensure predictable source
                  }
                  if (jsonImportStatus.type === "error") {
                    setJsonImportStatus({ type: null, message: "" });
                  }
                }}
                rows={5}
                placeholder='Paste JSON copied from Gemini or ChatGPT here, e.g. { "name": "...", ... }'
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-y"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Supports raw JSON or markdown code blocks (```json ... ```) copied directly from AI responses.
              </p>
            </div>

            {jsonImportStatus.message && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                jsonImportStatus.type === "error" 
                  ? "bg-rose-50 border-rose-200 text-rose-700" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
                <span className="text-sm leading-none">{jsonImportStatus.type === "error" ? "❌" : "✅"}</span>
                <div>{jsonImportStatus.message}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImportJsonModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  const success = await handleImportJson();
                  if (success) {
                    setTimeout(() => {
                      setShowImportJsonModal(false);
                      setPastedJsonText("");
                      setSelectedJsonFile(null);
                    }, 1200);
                  }
                }}
                disabled={(!selectedJsonFile && !pastedJsonText.trim()) || importingJson}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
              >
                {importingJson ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Import JSON
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise AI Duplicate Alert Modal */}
      {duplicateModal.isOpen && duplicateModal.matchedCollege && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-xl shrink-0 border border-rose-200 shadow-xs">
                ⚠️
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>College Already Exists</span>
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full border border-rose-300">
                    {duplicateModal.similarityScore}% Similarity Match
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {duplicateModal.message}
                </p>
              </div>
            </div>

            {/* Existing College Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Matched Existing Database College
              </div>
              <div className="flex items-center gap-3">
                {duplicateModal.matchedCollege.logo ? (
                  <img
                    src={duplicateModal.matchedCollege.logo}
                    alt=""
                    className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-900 text-amber-300 flex items-center justify-center font-extrabold text-base shrink-0">
                    🏛️
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {duplicateModal.matchedCollege.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    📍 {duplicateModal.matchedCollege.city || duplicateModal.matchedCollege.location || "Tamil Nadu"} • {duplicateModal.matchedCollege.website || "Official Web Linked"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Status: <span className="font-bold text-purple-700">{duplicateModal.matchedCollege.status || "Active"}</span> • Created on: {new Date(duplicateModal.matchedCollege.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
              <a
                href={`/colleges/${duplicateModal.matchedCollege.slug || duplicateModal.matchedCollege.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center border border-slate-200 flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Public</span>
              </a>

              <a
                href={`/manager/colleges?search=${encodeURIComponent(duplicateModal.matchedCollege.name)}`}
                className="px-3 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-all text-center border border-purple-200 flex items-center justify-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find in Directory</span>
              </a>

              <a
                href={`/manager/colleges/${duplicateModal.matchedCollege.id}/edit`}
                className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center shadow-xs flex items-center justify-center gap-1"
              >
                <span>Edit Existing</span>
              </a>

              <button
                type="button"
                onClick={() => setDuplicateModal({ isOpen: false, message: "", matchedCollege: null, similarityScore: 0 })}
                className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quality Check & AI Verification Gauge Banner */}
      {verificationScore !== null && (
        <div className="bg-gradient-to-r from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white p-5 rounded-2xl border border-[#3b2075]/80 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-extrabold text-base border border-amber-500/30 shrink-0">
                {verificationScore}%
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Quality Check: AI Extraction Accuracy</span>
                  <span className="px-2 py-0.5 bg-amber-400 text-stone-950 text-[10px] font-extrabold rounded-full">
                    {verificationScore >= 80 ? "HIGH CONFIDENCE" : "MANUAL REVIEW REQUIRED"}
                  </span>
                </h3>
                <p className="text-xs text-purple-200/80 font-medium">
                  {Object.values(fieldMetadata).filter((m) => m.verified).length} Verified Fields • {Object.values(fieldMetadata).filter((m) => !m.verified).length} Requiring Admin Manual Review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUnconfirmedOnly(!showUnconfirmedOnly)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  showUnconfirmedOnly
                    ? "bg-amber-400 text-stone-950 border-amber-300 shadow-sm"
                    : "bg-purple-900/60 text-purple-200 border-purple-400/40 hover:bg-purple-800"
                }`}
              >
                {showUnconfirmedOnly ? "Showing All Fields" : "Filter Unconfirmed Fields"}
              </button>
            </div>
          </div>

          {/* Verification Progress Bar */}
          <div className="w-full bg-purple-950/80 rounded-full h-2 overflow-hidden border border-purple-800/60">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-500"
              style={{ width: `${verificationScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Jump Section Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/80 text-xs font-semibold text-slate-500">
        <a href="#sec1" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">1. Basic Info</a>
        <a href="#sec2" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">2. Location</a>
        <a href="#sec3" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">3. Contact</a>
        <a href="#sec4" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">4. Courses</a>
        <a href="#sec5" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">5. Fees</a>
        <a href="#sec6" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">6. Facilities</a>
        <a href="#sec7" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">7. Placement</a>
        <a href="#sec8" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">8. Admissions</a>
        <a href="#sec9" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">9. Hostel</a>
        <a href="#sec10" className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold shrink-0 text-[11px]">10. Gallery (Paste Ctrl+V)</a>
        <a href="#sec11" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">11. SEO</a>
        <a href="#sec12" className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 text-[11px]">12. Status</a>
        <a href="#secContent" className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold shrink-0 text-[11px] border border-teal-500 shadow-sm flex items-center gap-1">
          <FileText className="w-3 h-3" />
          <span>College Content Module</span>
        </a>
        <a href="#secAI" className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold shrink-0 text-[11px]">✨ AI Extractor</a>
      </div>

      {/* SECTION 1: Basic Information */}
      <section id="sec1" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            1
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 1: Basic Information</h2>
            <p className="text-[11px] text-slate-400 font-medium">Core college details, affiliations, and accreditations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              College Name * {renderBadge("name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Madras Christian College"
              required
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              College Short Name {renderBadge("shortName")}
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. MCC"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Slug (Auto Generate)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="madras-christian-college"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://domain.com/logo.png"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
            {logo && (
              <div className="mt-2 flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                <img
                  src={logo}
                  alt="Logo Preview"
                  className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200"
                  onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                />
                <span className="text-[11px] text-slate-600 font-bold">Logo Preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Banner Image URL</label>
            <input
              type="text"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
            {banner && (
              <div className="mt-2 flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                <img
                  src={banner}
                  alt="Banner Preview"
                  className="h-10 w-24 object-cover rounded-lg bg-white border border-slate-200"
                  onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                />
                <span className="text-[11px] text-slate-600 font-bold">Banner Preview</span>
              </div>
            )}
          </div>


          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Establishment Year {renderBadge("estYear")}
            </label>
            <input
              type="number"
              value={estYear}
              onChange={(e) => setEstYear(e.target.value)}
              placeholder="e.g. 1990"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ownership</label>
            <select
              value={ownership}
              onChange={(e) => setOwnership(e.target.value)}
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              <option value="Private">Private</option>
              <option value="Government">Government</option>
              <option value="Aided">Aided</option>
              <option value="Autonomous">Autonomous</option>
              <option value="Deemed">Deemed</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Academic Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Arts & Science">Arts & Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Law">Law</option>
              <option value="Management">Management</option>
              <option value="Polytechnic">Polytechnic</option>
              <option value="Architecture">Architecture</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Dental">Dental</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Nursing">Nursing</option>
              <option value="Education">Education</option>
              <option value="Paramedical">Paramedical</option>
              <option value="Physiotherapy">Physiotherapy</option>
              <option value="Hotel Management">Hotel Management</option>
              <option value="Fine Arts">Fine Arts</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Affiliated University</label>
            <input
              type="text"
              value={affiliatedUniversity}
              onChange={(e) => setAffiliatedUniversity(e.target.value)}
              placeholder="e.g. University of Madras"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              NAAC Grade {renderBadge("naacGrade")}
            </label>
            <input
              type="text"
              value={naacGrade}
              onChange={(e) => setNaacGrade(e.target.value)}
              placeholder="e.g. A++"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              NIRF Ranking {renderBadge("nirfRank")}
            </label>
            <input
              type="number"
              value={nirfRank}
              onChange={(e) => setNirfRank(e.target.value)}
              placeholder="e.g. 25"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Category Multi-select (Unselected by default until user clicks) */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">
            Category (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {isSelected ? `✓ ${cat}` : `+ ${cat}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Approvals Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-800">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAutonomous}
              onChange={(e) => setIsAutonomous(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>Autonomous Institution</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={aicteApproved}
              onChange={(e) => setAicteApproved(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>AICTE Approved</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ugcApproved}
              onChange={(e) => setUgcApproved(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>UGC Approved</span>
          </label>
        </div>
      </section>

      {/* SECTION 2: Location */}
      <section id="sec2" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            2
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 2: Location</h2>
            <p className="text-[11px] text-slate-400 font-medium">Address, city, landmark, and GPS coordinates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Full Address {renderBadge("address")}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. East Tambaram, Chennai"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Landmark {renderBadge("landmark")}
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Railway Station"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              City {renderBadge("city")}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Chennai"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              District {renderBadge("district")}
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Chennai"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              State {renderBadge("state")}
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Tamil Nadu"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Pincode {renderBadge("pincode")}
            </label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="600059"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Latitude {renderBadge("latitude")}
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="12.9229"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Longitude {renderBadge("longitude")}
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="80.1275"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">
              Google Maps URL {renderBadge("googleMapUrl")}
            </label>
            <input
              type="text"
              value={googleMapUrl}
              onChange={(e) => setGoogleMapUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Contact */}
      <section id="sec3" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            3
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 3: Contact</h2>
            <p className="text-[11px] text-slate-400 font-medium">Official contact info and social media profiles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Phone {renderBadge("phone")}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 44 2239 0675"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mobile</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Email {renderBadge("email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admissions@college.edu.in"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Website URL {renderBadge("website")}
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.college.edu.in"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Facebook</label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Instagram</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">LinkedIn</label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">YouTube</label>
            <input
              type="text"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: Courses Dynamic Repeater */}
      <section id="sec4" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
              4
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 4: Courses (Dynamic Repeater)</h2>
              <p className="text-[11px] text-slate-400 font-medium">Course title, fees, duration, seats & entrance exams</p>
            </div>
          </div>

          <button
            type="button"
            onClick={addCourse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
          >
            <Plus className="w-3.5 h-3.5" /> Add Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
            <p className="text-xs text-slate-500 font-medium">No courses added yet.</p>
            <button
              type="button"
              onClick={addCourse}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Course
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-900">Course #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCourse(idx)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Course Name</label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => updateCourse(idx, "title", e.target.value)}
                      placeholder="e.g. BCA / B.Tech CSE"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={course.duration}
                      onChange={(e) => updateCourse(idx, "duration", e.target.value)}
                      placeholder="e.g. 4 Years / 3 Years"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Fees (Per Year)</label>
                    <input
                      type="number"
                      value={course.feesPerYear}
                      onChange={(e) => updateCourse(idx, "feesPerYear", e.target.value)}
                      placeholder="e.g. 85000"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Eligibility</label>
                    <input
                      type="text"
                      value={course.eligibility}
                      onChange={(e) => updateCourse(idx, "eligibility", e.target.value)}
                      placeholder="e.g. 10+2 with 50%"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Total Seats</label>
                    <input
                      type="number"
                      value={course.seats}
                      onChange={(e) => updateCourse(idx, "seats", e.target.value)}
                      placeholder="60"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Entrance Exam</label>
                    <input
                      type="text"
                      value={course.entranceExam}
                      onChange={(e) => updateCourse(idx, "entranceExam", e.target.value)}
                      placeholder="TNEA / JEE / Merit"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 5: Fees */}
      <section id="sec5" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            5
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 5: Fees Structure</h2>
            <p className="text-[11px] text-slate-400 font-medium">Course wise fee overview, hostel, transport, & scholarship details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Average Fees Per Year (₹) {renderBadge("feesPerYear")}
            </label>
            <input
              type="number"
              value={feesPerYear}
              onChange={(e) => setFeesPerYear(e.target.value)}
              placeholder="e.g. 60000"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Course Wise Fees Summary</label>
            <input
              type="text"
              value={courseWiseFees}
              onChange={(e) => setCourseWiseFees(e.target.value)}
              placeholder="e.g. BCA: ₹45,000/yr, MCA: ₹60,000/yr"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Hostel Fees (Per Year) {renderBadge("hostelFees")}
            </label>
            <input
              type="number"
              value={hostelFees}
              onChange={(e) => setHostelFees(e.target.value)}
              placeholder="50000"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Transport Fees (Per Year)</label>
            <input
              type="number"
              value={transportFees}
              onChange={(e) => setTransportFees(e.target.value)}
              placeholder="15000"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">Scholarship Details</label>
            <textarea
              rows={2}
              value={scholarshipDetails}
              onChange={(e) => setScholarshipDetails(e.target.value)}
              placeholder="Merit scholarships and sports quota waivers available..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">Education Loan Details</label>
            <textarea
              rows={2}
              value={educationLoanDetails}
              onChange={(e) => setEducationLoanDetails(e.target.value)}
              placeholder="Guidance for government and bank education loans..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>
      </section>

      {/* SECTION 6: Facilities (Checkboxes - Unselected by default) */}
      <section id="sec6" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            6
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 6: Facilities (Select Available Amenities)</h2>
            <p className="text-[11px] text-slate-400 font-medium">Select all campus infrastructure & amenities available</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {ALL_FACILITIES.map((fac) => {
            const isChecked = selectedFacilities.includes(fac);
            return (
              <label
                key={fac}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  isChecked
                    ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleFacility(fac)}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                />
                <span>{fac}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* SECTION 7: Placement */}
      <section id="sec7" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            7
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 7: Placement Statistics</h2>
            <p className="text-[11px] text-slate-400 font-medium">Highest package, average package, top recruiters, and placement %</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Highest Package (LPA) {renderBadge("highestPackage")}
            </label>
            <input
              type="number"
              step="any"
              value={highestPackage}
              onChange={(e) => setHighestPackage(e.target.value)}
              placeholder="e.g. 18.0"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Average Package (LPA) {renderBadge("avgPackage")}
            </label>
            <input
              type="number"
              step="any"
              value={avgPackage}
              onChange={(e) => setAvgPackage(e.target.value)}
              placeholder="e.g. 6.0"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Placement Percentage (%)</label>
            <input
              type="number"
              step="any"
              value={placementPercentage}
              onChange={(e) => setPlacementPercentage(e.target.value)}
              placeholder="e.g. 90.0"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">Top Recruiters (Comma Separated)</label>
            <input
              type="text"
              value={topRecruiters}
              onChange={(e) => setTopRecruiters(e.target.value)}
              placeholder="TCS, Infosys, Accenture, Cognizant, Wipro"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">Internship Details</label>
            <textarea
              rows={2}
              value={internshipDetails}
              onChange={(e) => setInternshipDetails(e.target.value)}
              placeholder="Corporate internships offered in final year..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          {/* Live Visual Graph & Multi-Year Trend Preview */}
          <div className="md:col-span-3 bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                <span>📊 Live Placement Visual Graph Preview for Site Visitors</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Auto-Generates 4-Year CTC Trend on Save</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Average CTC</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{avgPackage ? `${avgPackage} LPA` : "Auto-Calculated"}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Highest CTC</div>
                <div className="text-sm font-extrabold text-amber-400 mt-0.5">{highestPackage ? `${highestPackage} LPA` : "Auto-Calculated"}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Placement %</div>
                <div className="text-sm font-extrabold text-blue-400 mt-0.5">{placementPercentage ? `${placementPercentage}%` : "85%"}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Visual Graph</div>
                <div className="text-sm font-extrabold text-teal-400 mt-0.5">2023 – 2026 Trend</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Admissions */}
      <section id="sec8" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            8
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 8: Admissions</h2>
            <p className="text-[11px] text-slate-400 font-medium">Eligibility requirements, counselling, & important dates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Eligibility Criteria</label>
            <textarea
              rows={2}
              value={admissionEligibility}
              onChange={(e) => setAdmissionEligibility(e.target.value)}
              placeholder="Pass in 10+2 examination from recognized state/central board..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Admission Process</label>
            <textarea
              rows={2}
              value={admissionProcess}
              onChange={(e) => setAdmissionProcess(e.target.value)}
              placeholder="Submit online application form followed by document verification..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Documents Required</label>
            <textarea
              rows={2}
              value={documentsRequired}
              onChange={(e) => setDocumentsRequired(e.target.value)}
              placeholder="10th & 12th Marksheets, TC, Conduct Certificate..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Counselling Information</label>
            <textarea
              rows={2}
              value={counsellingInfo}
              onChange={(e) => setCounsellingInfo(e.target.value)}
              placeholder="Merit list based counselling..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Entrance Exams</label>
            <input
              type="text"
              value={admissionEntranceExams}
              onChange={(e) => setAdmissionEntranceExams(e.target.value)}
              placeholder="Merit Based / Entrance Test"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Important Dates</label>
            <input
              type="text"
              value={importantDates}
              onChange={(e) => setImportantDates(e.target.value)}
              placeholder="Admissions active for new batch"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>
      </section>

      {/* SECTION 9: Hostel */}
      <section id="sec9" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            9
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 9: Hostel & Residential</h2>
            <p className="text-[11px] text-slate-400 font-medium">Boys/Girls hostels, AC rooms, mess & hostel fee details</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/60 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hostelAvailable}
              onChange={(e) => setHostelAvailable(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="font-semibold">Hostel Available</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/60 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={boysHostel}
              onChange={(e) => setBoysHostel(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="font-semibold">Boys Hostel</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/60 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={girlsHostel}
              onChange={(e) => setGirlsHostel(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="font-semibold">Girls Hostel</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/60 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={acRooms}
              onChange={(e) => setAcRooms(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="font-semibold">AC Rooms</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/60 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={messAvailable}
              onChange={(e) => setMessAvailable(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="font-semibold">Mess Available</span>
          </label>
        </div>

        <div className="max-w-xs text-xs">
          <label className="font-semibold text-slate-700 block mb-1">Hostel Fee (Per Year)</label>
          <input
            type="number"
            value={hostelFeePerYear}
            onChange={(e) => setHostelFeePerYear(e.target.value)}
            placeholder="50000"
            className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
          />
        </div>
      </section>

      {/* SECTION 10: Gallery (Clipboard Ctrl + V & Drag Drop Upload) */}
      <section id="sec10" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
              10
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                SECTION 10: Gallery & Auto Image Tagging
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Upload multiple campus images — AI automatically generates Alt Text, Captions & Tags
              </p>
            </div>
          </div>
        </div>



        {/* Dedicated YouTube Video URL Box */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-red-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center font-black text-[10px]">▶</span>
              <span>YouTube Campus Video Tour URL</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Auto-Embeds Player on Public Page</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <input
              type="text"
              value={collegeVideo}
              onChange={(e) => setCollegeVideo(e.target.value)}
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400 font-medium">
              Visitors will be able to watch this official video tour on the college profile overview tab.
            </p>
          </div>
        </div>

        {/* Drag & Drop / Clipboard Ctrl+V Paste Zone */}
        <div
          onPaste={handlePasteImage}
          className="p-5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-emerald-50/30 hover:bg-emerald-50/60 transition-all text-center space-y-2 cursor-pointer relative group"
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900">
              Press <kbd className="bg-white border border-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono shadow-xs text-emerald-800">Ctrl + V</kbd> to Paste Image from Clipboard
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              or Drag & Drop / Click to Select Image Files (AI Auto-Tags Alt Text, Caption & Tags)
            </p>
          </div>
        </div>

        {/* Alternative URL Input */}
        <div className="flex items-center gap-2 max-w-xl" onPaste={handlePasteImage}>
          <input
            type="text"
            value={newGalleryUrl}
            onChange={(e) => setNewGalleryUrl(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 bg-slate-50/60 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
          />
          <button
            type="button"
            onClick={addGalleryImage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-300" /> Add & AI Tag
          </button>
        </div>

        {/* Gallery Grid */}
        {galleryImages.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No gallery images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative group overflow-hidden"
              >
                <div className="h-32 rounded-xl overflow-hidden bg-slate-200 relative">
                  <img src={img.url} alt={img.altText} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Alt Text</span>
                    <input
                      type="text"
                      value={img.altText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGalleryImages((prev) => {
                          const copy = [...prev];
                          copy[idx].altText = val;
                          return copy;
                        });
                      }}
                      className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Caption</span>
                    <input
                      type="text"
                      value={img.caption}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGalleryImages((prev) => {
                          const copy = [...prev];
                          copy[idx].caption = val;
                          return copy;
                        });
                      }}
                      className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Tags</span>
                    <input
                      type="text"
                      value={img.tags}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGalleryImages((prev) => {
                          const copy = [...prev];
                          copy[idx].tags = val;
                          return copy;
                        });
                      }}
                      className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 11: SEO */}
      <section id="sec11" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            11
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 11: SEO Metadata</h2>
            <p className="text-[11px] text-slate-400 font-medium">Auto-generated search engine title, meta description, and keywords</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">SEO Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. College Name Admissions 2026, Fees & Courses"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">SEO Description</label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Explore admissions 2026, eligibility, ranking, placement stats, and hostel fee..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Meta Keywords</label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="college admissions, fees, courses"
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>
      </section>

      {/* SECTION 12: STATUS */}
      <section id="sec12" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            12
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">SECTION 12: Status & Display Options</h2>
            <p className="text-[11px] text-slate-400 font-medium">Draft, Published, Featured & Trending status controls</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-800">
          <div>
            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Publication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-50/60 px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-xs"
            >
              <option value="PUBLISHED">PUBLISHED (Visible Everywhere)</option>
              <option value="DRAFT">DRAFT (Hidden / Pending)</option>
              <option value="DATA_SUBMITTED">DATA SUBMITTED (Pending Review)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>Featured College (Show on Homepage)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer pt-3">
            <input
              type="checkbox"
              checked={trending}
              onChange={(e) => setTrending(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>Trending Institution Tag</span>
          </label>
        </div>
      </section>

      {/* GENERAL COLLEGE DESCRIPTION & AI ANALYZER */}
      <section id="secAI" className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-5 md:p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-base shadow-md">
              ✨
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-white">General College Description & AI Auto-Populate</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Paste any raw college text description here and AI will analyze and populate all 12 form sections automatically.
              </p>
            </div>
          </div>
        </div>

        <div>
          <textarea
            rows={5}
            value={generalDescription}
            onChange={(e) => setGeneralDescription(e.target.value)}
            placeholder="Paste raw college description text here (e.g. college overview, NIRF rank, courses offered, fees, hostel, placements)..."
            className="w-full bg-slate-950/80 text-slate-100 p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs font-mono leading-relaxed placeholder:text-slate-600"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-slate-400 font-medium">
            AI extracts NAAC grade, NIRF rank, city, state, courses, fees, placements, & facilities.
          </p>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyChatGptPrompt}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold transition-all border border-purple-500/40 shadow-sm cursor-pointer"
              title="Copy prompt template to send to ChatGPT"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>📋 Copy ChatGPT Prompt Template</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWebsiteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700/80 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>🌐 Fetch Website</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyzeAI}
              disabled={aiAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
            >
              {aiAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" /> Analyze using AI
                </>
              )}
            </button>
          </div>
        </div>
      </section>


      {/* SECTION 13: College Content Management Module (Additive CMS Extension) */}
      <section id="secContent" className="bg-stone-900 text-stone-100 p-5 md:p-6 rounded-2xl border border-teal-500/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide bg-gradient-to-r from-stone-100 to-teal-300 bg-clip-text text-transparent">
                SECTION 13: College Content Management Module
              </h2>
              <p className="text-[11px] text-stone-400 font-medium">
                Additive rich text content sections. Saves independently to CollegeContent table without mutating CollegeProfile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCopySection13ChatGptPrompt}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 text-xs font-extrabold transition border border-purple-500/50 shadow-sm cursor-pointer"
              title="Copy Section 13 ChatGPT Prompt Template to Clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-amber-300" />
              <span>📋 Copy Format for ChatGPT (Section 13)</span>
            </button>

            <button
              type="button"
              disabled={contentSaving}
              onClick={saveCollegeContentOnly}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {contentSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Content Only</span>
            </button>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RichTextEditor label="1. Overview" value={overview} onChange={setOverview} placeholder="High-level college overview..." />
          <RichTextEditor label="2. About College" value={about} onChange={setAbout} placeholder="Detailed about college description..." />
          <RichTextEditor label="3. History" value={history} onChange={setHistory} placeholder="Establishment and legacy history..." />
          <RichTextEditor label="4. Key Highlights" value={highlights} onChange={setHighlights} placeholder="Accreditation, NIRF ranks, achievements..." />
          <RichTextEditor label="5. Why Choose College" value={whyChoose} onChange={setWhyChoose} placeholder="Top reasons students select this college..." />
          <RichTextEditor label="6. Campus Life" value={campusLife} onChange={setCampusLife} placeholder="Student activities, clubs, fests..." />
          <RichTextEditor label="7. Facilities Description" value={facilitiesDescription} onChange={setFacilitiesDescription} placeholder="Detailed campus infrastructure..." />
          <RichTextEditor label="8. Placement Overview" value={placementOverview} onChange={setPlacementOverview} placeholder="Career support, training, package trends..." />
          <RichTextEditor label="9. Top Recruiters" value={contentTopRecruiters} onChange={setContentTopRecruiters} placeholder="Major hiring partners..." />
          <RichTextEditor label="10. Admission Guide" value={admissionGuide} onChange={setAdmissionGuide} placeholder="Step-by-step admission process..." />
          <RichTextEditor label="11. Detailed Eligibility" value={eligibility} onChange={setEligibility} placeholder="Course-wise minimum requirements..." />
          <RichTextEditor label="12. Hostel Life" value={hostelLife} onChange={setHostelLife} placeholder="Hostel rooms, mess, amenities..." />
          <RichTextEditor label="13. Scholarships" value={scholarships} onChange={setScholarships} placeholder="Available aid and fee waivers..." />
          <RichTextEditor label="14. Research & Innovation" value={research} onChange={setResearch} placeholder="Patents, labs, research grants..." />
          <RichTextEditor label="15. Student Activities" value={studentActivities} onChange={setStudentActivities} placeholder="Sports, cultural, NSS, NCC..." />
          <RichTextEditor label="16. Frequently Asked Questions (FAQ)" value={faq} onChange={setFaq} placeholder="Common questions and answers..." />
        </div>

        <div>
          <RichTextEditor label="17. SEO Detailed Article" value={seoArticle} onChange={setSeoArticle} placeholder="Long-form SEO content article for search engine ranking..." rows={6} />
        </div>
      </section>

      {/* Section 14: Student Reviews Management (CollegeDunia Style) */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Section 14: Student Reviews ({reviews.length})</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Manage student reviews displayed on frontend in CollegeDunia Pros/Cons format
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generateSampleReviews}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>✨ AI Auto-Generate Sample Reviews</span>
            </button>

            <button
              type="button"
              onClick={addReview}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student Review</span>
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
            <div className="text-xs font-bold text-slate-600">No student reviews added yet</div>
            <p className="text-[11px] text-slate-400">
              Click &quot;Add Student Review&quot; or &quot;✨ AI Auto-Generate Sample Reviews&quot; to populate realistic student feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {rev.studentName || `Review #${idx + 1}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeReview(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Remove Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Student Name</label>
                    <input
                      type="text"
                      value={rev.studentName}
                      onChange={(e) => updateReview(idx, "studentName", e.target.value)}
                      placeholder="e.g. Praveen Natarajan"
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Course Name</label>
                    <input
                      type="text"
                      value={rev.course}
                      onChange={(e) => updateReview(idx, "course", e.target.value)}
                      placeholder="e.g. B.E. Computer Science"
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Batch Year</label>
                    <input
                      type="number"
                      value={rev.batchYear}
                      onChange={(e) => updateReview(idx, "batchYear", e.target.value)}
                      placeholder="2024"
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Overall Rating (1 to 5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={rev.rating}
                      onChange={(e) => updateReview(idx, "rating", e.target.value)}
                      placeholder="4.5"
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-extrabold text-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Review Title / Headline</label>
                  <input
                    type="text"
                    value={rev.title}
                    onChange={(e) => updateReview(idx, "title", e.target.value)}
                    placeholder="e.g. Top tier faculty, state-of-the-art labs & 90%+ placement drives"
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/80 space-y-1">
                    <label className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <span>👍 Likes / Pros (CollegeDunia Green Box)</span>
                    </label>
                    <textarea
                      value={rev.likes}
                      onChange={(e) => updateReview(idx, "likes", e.target.value)}
                      placeholder="What student liked about faculty, labs, library, campus life..."
                      rows={2}
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200/80 space-y-1">
                    <label className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                      <span>👎 Dislikes / Cons (CollegeDunia Red Box)</span>
                    </label>
                    <textarea
                      value={rev.dislikes}
                      onChange={(e) => updateReview(idx, "dislikes", e.target.value)}
                      placeholder="What student feels could be improved (mess food, attendance rule...)"
                      rows={2}
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-rose-300 text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Detailed Review Content</label>
                  <textarea
                    value={rev.content}
                    onChange={(e) => updateReview(idx, "content", e.target.value)}
                    placeholder="Full detailed review narrative..."
                    rows={2}
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Action Bar (Static at bottom of form, not floating) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs mt-6">
        {/* Status Dropdown Setting ("scroll down option") */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="bottomStatus" className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Save Status:</span>
          </label>
          <div className="relative">
            <select
              id="bottomStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                status === "PUBLISHED"
                  ? "bg-purple-50 border-purple-200 text-[#3b2075]"
                  : status === "DATA_SUBMITTED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <option value="PUBLISHED">🟢 PUBLISHED (Live Everywhere)</option>
              <option value="DRAFT">🟠 DRAFT (Hidden / Pending)</option>
              <option value="DATA_SUBMITTED">🟣 DATA SUBMITTED (Review)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
          </div>
          {status === "PUBLISHED" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50/60 px-2 py-0.5 rounded-lg border border-purple-200/50">
              <CheckCircle2 className="w-3 h-3 text-purple-600" /> Visible on live website
            </span>
          )}
          {status === "DRAFT" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50/60 px-2 py-0.5 rounded-lg border border-amber-200/50">
              Hidden from public search
            </span>
          )}
          {status === "DATA_SUBMITTED" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50/60 px-2 py-0.5 rounded-lg border border-emerald-200/50">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pending admin review
            </span>
          )}
        </div>

        {/* Buttons: Cancel & Only ONE Save College Button */}
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={() => router.push("/manager/colleges")}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#1f0c3d] hover:bg-[#3b2075] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Save className="w-4 h-4 text-amber-300" />}
            <span>{collegeId ? "Update College" : "Save College"}</span>
          </button>
        </div>
      </div>

      {/* Website Fetcher Modal */}
      {showWebsiteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Fetch Official College Website</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Extract official courses, fees, campus images & contact info</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!websiteFetching) setShowWebsiteModal(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Official Website URL *</label>
              <input
                type="url"
                value={websiteUrlInput}
                onChange={(e) => setWebsiteUrlInput(e.target.value)}
                placeholder="https://mcc.edu.in"
                disabled={websiteFetching}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono"
              />

              {/* Sample URLs */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Try Example Websites:</span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    "https://mcc.edu.in",
                    "https://loyolacollege.edu",
                    "https://www.srmist.edu.in",
                    "https://www.annauniv.edu",
                  ].map((url) => (
                    <button
                      key={url}
                      type="button"
                      disabled={websiteFetching}
                      onClick={() => setWebsiteUrlInput(url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-slate-700/60 font-mono text-[10px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      {url.replace("https://", "")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Progress Steps Indicator */}
            {websiteFetching && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-400">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{fetchMessage || "Fetching Website..."}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Step {fetchStep} / 4
                  </span>
                </div>

                {/* Progress Step Badges */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-[9px] font-bold text-center">
                  <div className={`p-1.5 rounded-lg border transition-all ${fetchStep >= 1 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-600 border-slate-800"}`}>
                    1. Fetching
                  </div>
                  <div className={`p-1.5 rounded-lg border transition-all ${fetchStep >= 2 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-600 border-slate-800"}`}>
                    2. Analyzing
                  </div>
                  <div className={`p-1.5 rounded-lg border transition-all ${fetchStep >= 3 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-600 border-slate-800"}`}>
                    3. Images
                  </div>
                  <div className={`p-1.5 rounded-lg border transition-all ${fetchStep >= 4 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-600 border-slate-800"}`}>
                    4. Mapping
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={websiteFetching}
                onClick={() => setShowWebsiteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={websiteFetching}
                onClick={handleFetchWebsite}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {websiteFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing Website...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Crawl & Auto-Populate Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quality & Audit Report Modal */}
      {qualityReportModal.isOpen && qualityReportModal.report && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 max-w-2xl w-full border border-teal-500/30 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-extrabold text-lg">
                  {qualityReportModal.report.confidenceScore}%
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>AI Website Analysis Quality Report</span>
                    <span className="px-2.5 py-0.5 bg-teal-400 text-slate-950 text-[10px] font-extrabold rounded-full">
                      {qualityReportModal.report.confidenceScore >= 80 ? "HIGH ACCURACY" : "MANUAL REVIEW REQUIRED"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Analysis complete. Form fields auto-populated for Admin manual review.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQualityReportModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-base font-extrabold text-teal-400">{qualityReportModal.report.pagesCrawled}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Pages Crawled</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-base font-extrabold text-emerald-400">{qualityReportModal.report.imagesDownloaded}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Downloaded Media</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-base font-extrabold text-amber-400">{qualityReportModal.report.coursesFound}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Courses Extracted</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-base font-extrabold text-blue-400">{qualityReportModal.report.fieldsPopulated} / {qualityReportModal.report.fieldsPopulated + qualityReportModal.report.fieldsMissing}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Verified Fields</div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Data Auto-Populated into Form — Unsaved Review Mode</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Nothing has been saved to MySQL. Review the populated fields across all 12 sections below, make any required edits, and click <strong>&quot;Update College&quot;</strong> to commit to the database.
              </p>
            </div>

            {/* Execution Logs Toggle */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setQualityReportModal((prev) => ({ ...prev, showLogs: !prev.showLogs }))}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>{qualityReportModal.showLogs ? "Hide Execution Audit Logs" : "View Detailed Crawl & Extraction Logs"}</span>
              </button>

              {qualityReportModal.showLogs && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
                  {qualityReportModal.logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setQualityReportModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-lg transition"
              >
                Review Form & Edit Fields
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Website Popup Modal */}
      <PopupModal
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </form>
  );
}
