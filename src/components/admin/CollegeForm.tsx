"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PopupModal } from "@/components/ui/PopupModal";
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
} from "lucide-react";

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

interface CourseItem {
  title: string;
  duration: string;
  feesPerYear: string | number;
  eligibility: string;
  seats: string | number;
  entranceExam: string;
}

interface GalleryItem {
  url: string;
  altText: string;
  caption: string;
  tags: string;
}

export function CollegeForm({ initialData, collegeId }: { initialData?: any; collegeId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [websiteFetching, setWebsiteFetching] = useState(false);
  const [websiteUrlInput, setWebsiteUrlInput] = useState("");
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);

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

  function extractVal(dataObj: any, key: string): any {
    const item = dataObj ? dataObj[key] : null;
    if (item && typeof item === "object" && "value" in item) {
      setFieldMetadata((prev) => ({
        ...prev,
        [key]: {
          confidenceScore: item.confidenceScore ?? (item.verified ? 95 : 50),
          confidence: item.confidence || (item.verified ? "HIGH" : "LOW"),
          sourceUrl: item.sourceUrl || "",
          sourcePage: item.sourcePage || "",
          verified: Boolean(item.verified),
          verificationStatus: item.verificationStatus || (item.verified ? "VERIFIED" : "MANUAL_VERIFICATION_REQUIRED"),
          warning: item.warning || (item.verified ? undefined : "⚠ Please Enter Manually"),
        },
      }));
      // NEVER insert "Not Verified" text inside textbox value itself! Keep empty string "" for unverified values
      if (item.value === null || (typeof item.value === "string" && /^Not (Verified|Stated|Published|Mentioned)/i.test(item.value))) {
        return "";
      }
      return item.value;
    }
    return item;
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories ? initialData.categories.split(",").map((s: string) => s.trim()) : []
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
          title: c.title || "",
          duration: c.duration || "4 Years",
          feesPerYear: c.feesPerYear || "",
          eligibility: c.eligibility || "",
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
    initialData?.facilities
      ? initialData.facilities.split(",").map((s: string) => s.trim())
      : []
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

  // General College Description Textarea (Default empty so admin inputs fresh or uses AI)
  const [generalDescription, setGeneralDescription] = useState(initialData?.description || "");

  // Duplicate Alert Modal State
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

    if (data.verificationScore !== undefined) {
      setVerificationScore(data.verificationScore);
    }

    const nVal = extractVal(data, "name");
    if (nVal) setName(nVal);

    const snVal = extractVal(data, "shortName");
    if (snVal) setShortName(snVal);

    const slVal = extractVal(data, "slug");
    if (slVal) setSlug(slVal);

    const estVal = extractVal(data, "estYear");
    if (estVal) setEstYear(estVal);

    const ownVal = extractVal(data, "ownership");
    if (ownVal) setOwnership(ownVal);

    const typeVal = extractVal(data, "type");
    if (typeVal) setType(typeVal);

    const catVal = extractVal(data, "categories");
    if (Array.isArray(catVal) && catVal.length) setSelectedCategories(catVal);

    const affVal = extractVal(data, "affiliatedUniversity");
    if (affVal) setAffiliatedUniversity(affVal);

    const autoVal = extractVal(data, "isAutonomous");
    if (typeof autoVal === "boolean") setIsAutonomous(autoVal);

    const accVal = extractVal(data, "accreditation");
    if (accVal) setAccreditation(accVal);

    const appVal = extractVal(data, "approval");
    if (appVal) setApproval(appVal);

    const naacVal = extractVal(data, "naacGrade");
    if (naacVal) setNaacGrade(naacVal);

    const nirfVal = extractVal(data, "nirfRank");
    if (nirfVal) setNirfRank(nirfVal);

    const addrVal = extractVal(data, "address");
    if (addrVal) setAddress(addrVal);

    const lmVal = extractVal(data, "landmark");
    if (lmVal) setLandmark(lmVal);

    const arVal = extractVal(data, "area");
    if (arVal) setArea(arVal);

    const cityVal = extractVal(data, "city");
    if (cityVal) setCity(cityVal);

    const distVal = extractVal(data, "district");
    if (distVal) setDistrict(distVal);

    const stVal = extractVal(data, "state");
    if (stVal) setState(stVal);

    const pinVal = extractVal(data, "pincode");
    if (pinVal) setPincode(pinVal);

    const mapVal = extractVal(data, "googleMapUrl");
    if (mapVal) setGoogleMapUrl(mapVal);

    const latVal = extractVal(data, "latitude");
    if (latVal) setLatitude(latVal);

    const lngVal = extractVal(data, "longitude");
    if (lngVal) setLongitude(lngVal);

    const phVal = extractVal(data, "phone");
    if (phVal) setPhone(phVal);

    const mobVal = extractVal(data, "mobile");
    if (mobVal) setMobile(mobVal);

    const emVal = extractVal(data, "email");
    if (emVal) setEmail(emVal);

    const webVal = extractVal(data, "website");
    if (webVal) setWebsite(webVal);

    const fbVal = extractVal(data, "facebook");
    if (fbVal) setFacebook(fbVal);

    const instaVal = extractVal(data, "instagram");
    if (instaVal) setInstagram(instaVal);

    const linVal = extractVal(data, "linkedin");
    if (linVal) setLinkedin(linVal);

    const ytVal = extractVal(data, "youtube");
    if (ytVal) setYoutube(ytVal);

    if (Array.isArray(data.courses) && data.courses.length) {
      setCourses(
        data.courses.map((c: any) => ({
          title: c.title || "",
          duration: c.duration || "4 Years",
          feesPerYear: c.feesPerYear || "",
          eligibility: c.eligibility || "50% in 10+2",
          seats: c.seats || "",
          entranceExam: c.entranceExam || "",
        }))
      );
    }

    const feesVal = extractVal(data, "feesPerYear");
    if (feesVal) setFeesPerYear(feesVal);

    const cwFeesVal = extractVal(data, "courseWiseFees");
    if (cwFeesVal) setCourseWiseFees(cwFeesVal);

    const hFeesVal = extractVal(data, "hostelFees");
    if (hFeesVal) setHostelFees(hFeesVal);

    const tFeesVal = extractVal(data, "transportFees");
    if (tFeesVal) setTransportFees(tFeesVal);

    const schVal = extractVal(data, "scholarshipDetails");
    if (schVal) setScholarshipDetails(schVal);

    const facVal = extractVal(data, "facilities");
    if (Array.isArray(facVal) && facVal.length) setSelectedFacilities(facVal);

    const hPkgVal = extractVal(data, "highestPackage");
    if (hPkgVal) setHighestPackage(hPkgVal);

    const avgPkgVal = extractVal(data, "avgPackage");
    if (avgPkgVal) setAvgPackage(avgPkgVal);

    const plPctVal = extractVal(data, "placementPercentage");
    if (plPctVal) setPlacementPercentage(plPctVal);

    const recruitersVal = extractVal(data, "topRecruiters");
    if (recruitersVal) setTopRecruiters(recruitersVal);

    const admEligVal = extractVal(data, "admissionEligibility");
    if (admEligVal) setAdmissionEligibility(admEligVal);

    const admProcVal = extractVal(data, "admissionProcess");
    if (admProcVal) setAdmissionProcess(admProcVal);

    const docsVal = extractVal(data, "documentsRequired");
    if (docsVal) setDocumentsRequired(docsVal);

    const logoVal = extractVal(data, "logo");
    if (logoVal) setLogo(logoVal);

    const bannerVal = extractVal(data, "banner");
    if (bannerVal) setBanner(bannerVal);

    if (Array.isArray(data.candidateGalleryImages)) {
      setCandidateGalleryImages(data.candidateGalleryImages);
      setFoundGalleryImagesCount(data.foundGalleryImagesCount || data.candidateGalleryImages.length);
      setSelectedCandidateUrls(data.candidateGalleryImages.map((img: any) => img.url));
    } else if (Array.isArray(data.extractedImages) && data.extractedImages.length) {
      setGalleryImages(
        data.extractedImages.map((img: any) => ({
          url: img.url,
          altText: img.altText || "Official Campus Image",
          caption: img.caption || "Verified Campus Photo",
          tags: img.type || "CAMPUS",
        }))
      );
    }
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
        showPopup("✨ AI successfully extracted and populated all matching form fields!", "success", "AI Data Extracted");
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
          showPopup(`🌐 Successfully scraped & populated details from ${websiteUrlInput}!`, "success", "Website Scraped");
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
        type: type || "Private",
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
        description: generalDescription || `${safeName} is a leading educational institution.`,

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
      };

      console.log("[FRONTEND SAVE] 2. Payload Prepared:", payload);

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
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 font-sans">
      {/* Top Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs relative">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            {collegeId ? `Edit ${name || "College"}` : "Add New College Profile"}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Fill fields manually, parse with AI, or fetch from official website URL
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowWebsiteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>🌐 Fetch Website</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-300" />}
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
                    📍 {duplicateModal.matchedCollege.city || "Tamil Nadu"} • {duplicateModal.matchedCollege.website || "Official Web Linked"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Created on: {new Date(duplicateModal.matchedCollege.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <a
                href={`/colleges/${duplicateModal.matchedCollege.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center border border-slate-200 flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Existing</span>
              </a>

              <a
                href={`/admin/colleges?edit=${duplicateModal.matchedCollege.id}`}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center shadow-xs flex items-center justify-center gap-1"
              >
                <span>Edit Existing</span>
              </a>

              <button
                type="button"
                onClick={() => setDuplicateModal({ isOpen: false, message: "", matchedCollege: null, similarityScore: 0 })}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                ✕ Cancel Save
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
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">College Video URL</label>
            <input
              type="text"
              value={collegeVideo}
              onChange={(e) => setCollegeVideo(e.target.value)}
              placeholder="https://youtube.com/embed/..."
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
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
              <option value="Govt-Aided">Govt-Aided</option>
              <option value="Deemed">Deemed</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">College Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              <option value="Autonomous">Autonomous</option>
              <option value="Affiliated">Affiliated</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
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
                      placeholder="60000"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Eligibility</label>
                    <input
                      type="text"
                      value={course.eligibility}
                      onChange={(e) => updateCourse(idx, "eligibility", e.target.value)}
                      placeholder="10+2 with 50%"
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

        {/* Candidate Gallery Import Bar */}
        {foundGalleryImagesCount > 0 && (
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b2075] text-amber-300 flex items-center justify-center font-extrabold text-sm shrink-0">
                🖼️
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#3b2075]">
                  Found {foundGalleryImagesCount} Campus Photos on Official Website
                </h3>
                <p className="text-[11px] text-purple-900/80 font-medium">
                  Optional Gallery Import: Review and select photos before importing into college profile
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowImportGalleryModal(true)}
              className="px-4 py-2 rounded-xl bg-[#3b2075] hover:bg-[#2d1659] text-amber-300 text-xs font-extrabold shadow-sm transition-all border border-purple-400/40 cursor-pointer shrink-0"
            >
              Review & Import Gallery ({foundGalleryImagesCount})
            </button>
          </div>
        )}

        {/* Candidate Gallery Import Review Modal */}
        {showImportGalleryModal && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    🖼️ Found {foundGalleryImagesCount} Campus Gallery Images
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Select the high-quality campus photos you want to add to this college profile
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportGalleryModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-extrabold text-base"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                {candidateGalleryImages.map((img, idx) => {
                  const isChecked = selectedCandidateUrls.includes(img.url);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedCandidateUrls((prev) =>
                          prev.includes(img.url) ? prev.filter((u) => u !== img.url) : [...prev, img.url]
                        );
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isChecked ? "border-emerald-500 shadow-md ring-2 ring-emerald-400/30" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-24 object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isChecked ? "bg-emerald-600 text-white" : "bg-black/50 text-white"}`}>
                          {isChecked ? "✓" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-600 font-semibold">
                  Selected {selectedCandidateUrls.length} of {candidateGalleryImages.length} images
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportGalleryModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const toImport = candidateGalleryImages.filter((img) => selectedCandidateUrls.includes(img.url));
                      setGalleryImages((prev) => [
                        ...prev,
                        ...toImport.map((img) => ({
                          url: img.url,
                          altText: img.altText || "Official Campus Image",
                          caption: img.caption || "Verified Campus Photo",
                          tags: "CAMPUS",
                        })),
                      ]);
                      setShowImportGalleryModal(false);
                      showPopup(`Imported ${toImport.length} gallery images!`, "success", "Gallery Updated");
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Import Selected ({selectedCandidateUrls.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
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
              className="bg-slate-50/60 px-3.5 py-2 rounded-xl border border-slate-300 font-bold"
            >
              <option value="PUBLISHED">PUBLISHED (Visible Everywhere)</option>
              <option value="DRAFT">DRAFT (Hidden / Pending)</option>
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

          <div className="flex items-center gap-2.5">
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

      {/* Bottom Sticky Save Button */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.push("/manager/colleges")}
          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-300" />}
          <span>{collegeId ? "Update College" : "Save College"}</span>
        </button>
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
