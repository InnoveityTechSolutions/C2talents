export function isValidEmail(email: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  if (/example|domain|sample|user@|email@/i.test(email)) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

export function isValidPhone(phone: string | null): boolean {
  if (!phone || typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidUrl(url: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function stripHtmlTags(str: string | null): string | null {
  if (!str || typeof str !== "string") return str;
  return str.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

import { getCourseDeduplicationKey } from "@/lib/courses/courseDeduplication";

export function validateCourses(courses: any[]) {
  if (!Array.isArray(courses)) return [];
  
  const courseDenyList = ['award', 'news', 'event', 'hostel', 'library', 'placement', 'admission', 'message', 'gallery', 'achievement', 'malaysia', 'principal', 'committee', 'chairman', 'syllabus', 'result', 'contact', 'notice', 'circular', 'timetable'];
  
  const uniqueCourses = new Map();
  
  for (const c of courses) {
    if (!c || typeof c !== 'object') continue;
    let name = c.title || c.courseName || "";
    name = stripHtmlTags(name) || "";
    if (!name || name.length < 2 || name.length > 80) continue;
    
    const normalizedTitle = name.toLowerCase();
    
    let isDenied = false;
    for (const denyWord of courseDenyList) {
      if (normalizedTitle.includes(denyWord)) {
        isDenied = true;
        break;
      }
    }
    if (isDenied) continue;
    
    const dedupKey = getCourseDeduplicationKey(name);
    if (!uniqueCourses.has(dedupKey)) {
      uniqueCourses.set(dedupKey, {
        title: name,
        duration: c.duration || null,
        feesPerYear: typeof c.feesPerYear === 'number' ? c.feesPerYear : null,
        eligibility: c.eligibility || null,
        minGpa: typeof c.minGpa === 'number' ? c.minGpa : null,
        seats: typeof c.seats === 'number' ? c.seats : null,
        entranceExam: c.entranceExam || null,
      });
    }
  }
  
  return Array.from(uniqueCourses.values());
}

export function validateFacilities(facilities: any[]): string[] {
  if (!Array.isArray(facilities)) return [];
  const unique = new Set<string>();
  for (const f of facilities) {
    if (typeof f === 'string') {
      const clean = stripHtmlTags(f);
      if (clean && clean.length >= 2 && clean.length <= 50) {
        unique.add(clean);
      }
    }
  }
  return Array.from(unique);
}

export function validateExtraction(data: any) {
  if (!data) return data;

  // Validate Basic Info
  if (data.basicInfo) {
    if (data.basicInfo.website?.value && !isValidUrl(data.basicInfo.website.value)) {
      data.basicInfo.website.value = null;
    }
  }

  // Validate Contact Info
  if (data.contactInfo) {
    if (data.contactInfo.email?.value && !isValidEmail(data.contactInfo.email.value)) {
      data.contactInfo.email.value = null;
    }
    if (data.contactInfo.phone?.value && !isValidPhone(data.contactInfo.phone.value)) {
      data.contactInfo.phone.value = null;
    }
    if (data.contactInfo.mobile?.value && !isValidPhone(data.contactInfo.mobile.value)) {
      data.contactInfo.mobile.value = null;
    }
    if (data.contactInfo.googleMapUrl?.value && !isValidUrl(data.contactInfo.googleMapUrl.value)) {
      data.contactInfo.googleMapUrl.value = null;
    }
  }

  // Validate Courses
  if (data.courses) {
    data.courses = validateCourses(data.courses);
  }

  // Validate Facilities
  if (data.facilities) {
    data.facilities = validateFacilities(data.facilities);
  }

  return data;
}

