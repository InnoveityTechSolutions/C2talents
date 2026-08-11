import { PipelineData } from "../collection/types";

// Case-sensitive for short 2-3 letter degree codes to prevent matching English words like "be", "ba", "ma"
const DEGREE_SHORT_REGEX = /\b(B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|B\.?Arch|BBA|MBA|PGDM|BA\s+LLB|BBA\s+LLB|LLM|B\.?Sc|BCA|B\.?Com|B\.?A|M\.?A|M\.?Sc|MCA|M\.?Com|Ph\.?D|Diploma|D\.?Pharm|B\.?Pharm|MBBS|BDS|GNM|B\.?Litt|M\.?Phil|BPT|MPT|B\.?HM|M\.?HM|B\.?Ed|M\.?Ed)\b/g;

const DEGREE_FULL_REGEX = /\b(Bachelor\s+of\s+[A-Za-z\s&]+|Master\s+of\s+[A-Za-z\s&]+|Doctor\s+of\s+[A-Za-z\s&]+|Diploma\s+in\s+[A-Za-z\s&]+|Post\s+Graduate\s+Diploma\s+in\s+[A-Za-z\s&]+)\b/gi;

const DENY_PAGE_CATEGORIES = ["NEWS", "GALLERY", "ACHIEVEMENTS", "EVENTS", "AWARDS"];
const DENY_COURSE_WORDS = [
  "award", "news", "event", "hostel", "library", "placement", "admission", "message",
  "gallery", "achievement", "committee", "chairman", "syllabus", "result", "contact",
  "notice", "circular", "exam schedule", "time table", "fee structure", "download",
  "mandatory", "principal", "governing", "iqac", "naac", "nirf", "campus", "yond",
  "lapsed", "account", "viewed", "paid", "process", "boundries"
];

export function extractCourses(data: PipelineData) {
  const foundCoursesMap = new Map<string, any>();

  const addCourse = (title: string, rawDuration?: string, rawFees?: string, rawSeats?: string) => {
    let clean = title
      .replace(/\s+/g, " ")
      .replace(/^[\d.\-\s]+/, "")
      .split(/\b(View More|Click Here|Students Counselling|Read More|Apply Now|Form|Link)\b/i)[0]
      .trim();

    if (!clean || clean.length < 3 || clean.length > 70) return;

    const norm = clean.toLowerCase();
    if (DENY_COURSE_WORDS.some(w => norm.includes(w))) return;
    if (foundCoursesMap.has(norm)) return;

    let duration = rawDuration ? rawDuration.trim() : inferDuration(clean);
    let fees = rawFees ? parseFloat(rawFees.replace(/[^0-9.]/g, "")) || null : null;
    let seats = rawSeats ? parseInt(rawSeats.trim(), 10) || null : null;

    foundCoursesMap.set(norm, {
      title: clean,
      duration,
      feesPerYear: fees,
      eligibility: inferEligibility(clean),
      seats,
      entranceExam: inferEntranceExam(clean),
    });
  };

  // 1. Inspect HTML Tables across ALL pages
  for (const page of data.visitedPages) {
    const cat = (page.category || "").toUpperCase();
    if (DENY_PAGE_CATEGORIES.includes(cat)) continue;

    if (page.tables && page.tables.length > 0) {
      for (const table of page.tables) {
        const headersStr = table.headers.join(" ").toLowerCase();
        const firstRowStr = (table.rows[0] || []).join(" ").toLowerCase();

        if (/course|degree|programme|department|specialization|branch|intake/i.test(headersStr || firstRowStr)) {
          for (const row of table.rows) {
            if (row.length === 0) continue;
            const candidate = row[0].trim();
            if (
              DEGREE_SHORT_REGEX.test(candidate) ||
              /\b(Bachelor|Master|Diploma|Doctor|B\.?A|B\.?Sc|B\.?Com|B\.?E|B\.?Tech|M\.?A|M\.?Sc|M\.?Com|M\.?E|M\.?Tech|MBA|MCA|Ph\.?D)\b/.test(candidate)
            ) {
              let title = candidate;
              if (row[1] && row[1].length < 50 && !/\d{2,}/.test(row[1]) && !DEGREE_SHORT_REGEX.test(row[1])) {
                title += ` in ${row[1].trim()}`;
              }
              const durationCell = row.find(c => /year|yr|month/i.test(c));
              const feesCell = row.find(c => /₹|rs|lakh|fee/i.test(c));
              const seatsCell = row.find(c => /^\d{2,3}$/.test(c.trim()));

              addCourse(title, durationCell, feesCell, seatsCell);
            }
          }
        }
      }
    }

    // 2. Inspect HTML Lists across pages
    if (page.lists && page.lists.length > 0) {
      for (const list of page.lists) {
        for (const item of list) {
          if (
            DEGREE_SHORT_REGEX.test(item) ||
            /\b(Bachelor|Master|Diploma|B\.?A|B\.?Sc|B\.?Com|B\.?E|B\.?Tech|M\.?A|M\.?Sc|M\.?Com|M\.?E|M\.?Tech|MBA|MCA|Ph\.?D)\b/.test(item)
          ) {
            addCourse(item);
          }
        }
      }
    }

    // 3. Regex Match from Page Text
    const text = page.text;
    const matchesShort = Array.from(text.matchAll(DEGREE_SHORT_REGEX));
    for (const m of matchesShort) {
      const degreeStr = m[1].replace(/\./g, "");
      const afterText = text.slice(m.index! + m[0].length, m.index! + m[0].length + 65).trim();
      const specMatch = afterText.match(/^(?:(?:in|of|\-)\s+)?([A-Z][a-zA-Z&']*(?:\s+[A-Z][a-zA-Z&']*){0,4})/);

      let spec = "";
      if (specMatch && specMatch[1] && !/duration|fees|eligibility|seats|admission|about|contact/i.test(specMatch[1])) {
        spec = specMatch[1].replace(/\s+[A-Z]$/, "").trim();
      }

      const fullTitle = spec ? `${degreeStr} ${spec}` : degreeStr;
      addCourse(fullTitle);
    }

    const matchesFull = Array.from(text.matchAll(DEGREE_FULL_REGEX));
    for (const m of matchesFull) {
      addCourse(m[0]);
    }
  }

  // 4. Fallback: Parse from crawledContentSummaryText if < 3 courses found
  if (foundCoursesMap.size < 3 && data.crawledContentSummaryText) {
    const summaryText = data.crawledContentSummaryText;
    const fallbackMatches = Array.from(
      summaryText.matchAll(/\b(B\.?A|B\.?Sc|B\.?Com|BCA|BBA|M\.?A|M\.?Sc|M\.?Com|MCA|MBA|Ph\.?D|B\.?Tech|B\.?E|MBBS|L\.?L\.?B|Diploma)\s*(?:in|of)?\s*([A-Za-z0-9&\s\.\-]{3,40}?)(?=\n|\.|,|<|;|\)|$)/g)
    );

    for (const m of fallbackMatches) {
      const title = `${m[1]} ${m[2].trim()}`.replace(/\s+/g, " ");
      addCourse(title);
    }
  }

  return Array.from(foundCoursesMap.values());
}

function inferDuration(title: string): string {
  if (/B\.?Tech|B\.?E\.?|Bachelor of Technology|Bachelor of Engineering/i.test(title)) return "4 Years";
  if (/B\.?Arch|BA\s+LLB|BBA\s+LLB|MBBS|BDS/i.test(title)) return "5 Years";
  if (/MBA|MCA|M\.?Sc|M\.?Tech|M\.?E|M\.?Com|M\.?A|LLM|M\.?Phil|Master/i.test(title)) return "2 Years";
  if (/Ph\.?D|Doctor/i.test(title)) return "3 Years";
  if (/Diploma|D\.?Pharm/i.test(title)) return "3 Years";
  return "3 Years";
}

function inferEligibility(title: string): string {
  if (/MBA|MCA|M\.?Sc|M\.?Tech|M\.?E|M\.?A|M\.?Com|LLM|M\.?Phil|Master/i.test(title)) {
    return "Graduation with minimum 50% marks";
  }
  if (/Ph\.?D|Doctor/i.test(title)) {
    return "Master's Degree in relevant discipline with minimum 55%";
  }
  return "10+2 Pass with minimum 50% aggregate marks";
}

function inferEntranceExam(title: string): string {
  if (/B\.?Tech|B\.?E\.?/i.test(title)) return "JEE Main / State Entrance Exam";
  if (/MBA/i.test(title)) return "CAT / MAT / TANCET";
  if (/MCA/i.test(title)) return "TANCET / NIMCET";
  if (/MBBS|BDS/i.test(title)) return "NEET UG";
  if (/M\.?Tech/i.test(title)) return "GATE / TANCET";
  return "Merit Based / Entrance Exam";
}
