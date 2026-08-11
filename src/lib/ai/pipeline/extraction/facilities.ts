import { PipelineData } from "../collection/types";
import { getPagesForCategory } from "../collection/sourceFinder";

const ALL_KNOWN_FACILITIES = [
  "Library", "Sports", "WiFi", "Labs", "Hostel", "Auditorium", 
  "Transport", "Cafeteria", "Medical", "Gym", "ATM", "Bank", 
  "Placement Cell", "Research Centre", "Innovation Hub", "Seminar Hall", "Smart Classrooms"
];

export function extractFacilities(data: PipelineData) {
  // Extract strictly from Facilities, Infrastructure, Campus, Hostel pages
  const facilityPages = getPagesForCategory(data.visitedPages, ["FACILITIES", "HOSTEL"]);
  const sourceText = facilityPages.map(p => p.text).join("\n") || data.crawledContentSummaryText;
  
  return ALL_KNOWN_FACILITIES.filter(f => new RegExp(f.replace(" ", "\\s*"), "i").test(sourceText));
}

