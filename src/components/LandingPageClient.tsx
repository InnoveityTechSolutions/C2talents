"use client";

import * as React from "react";
import { Hero } from "./home/Hero";
import { StudyGoals } from "./home/StudyGoals";
import { ExploreTools } from "./home/ExploreTools";
import { TopRankedTable } from "./home/TopRankedTable";
import { CollegesGrid } from "./home/CollegesGrid";
import { AdmissionBanner } from "./home/AdmissionBanner";
import { CareerExcellenceBanner } from "./home/CareerExcellenceBanner";
import { RankingsCompare } from "./home/RankingsCompare";
import { NewsletterBanner } from "./home/NewsletterBanner";
import { CommunityBanner } from "./home/CommunityBanner";
import { TopDestinations } from "./home/TopDestinations";
import { WhyChooseUs } from "./home/WhyChooseUs";
import { ExploreCourses } from "./home/ExploreCourses";
import { TopExams } from "./home/TopExams";
import { StudyAbroad } from "./home/StudyAbroad";
import { TrendingTags } from "./home/TrendingTags";
import { FloatingCounselorButton } from "./home/FloatingCounselorButton";
import { ScrollToTopButton } from "./home/ScrollToTopButton";

interface College {
  id: string;
  name: string;
  location: string;
  rating: number;
  type: string;
  naacGrade: string | null;
  nirfRank: number | null;
  feesPerYear: number;
  avgPackage: number;
  highestPackage: number;
  image: string;
  featured: boolean;
  reviews: any[];
  placements: any[];
  courses: any[];
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  value: string;
  deadline: Date | string;
  type: string;
}

interface Review {
  id: string;
  rating: number;
  content: string;
  isVerified: boolean;
  studentName?: string | null;
  student?: { name: string } | null;
  college: { name: string };
}

interface Props {
  initialColleges: College[];
  initialScholarships: Scholarship[];
  initialReviews: Review[];
}

export function LandingPageClient({ initialColleges }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 2 ── Hero Area */}
      <Hero />

      {/* Section 3 ── Select Your Study Goal */}
      <StudyGoals />

      {/* Section 4 ── Explore Core Tools */}
      <ExploreTools />

      {/* Section 5 ── Top 10 Ranked Institutions */}
      <TopRankedTable colleges={initialColleges} />

      {/* Section 6 ── Top Colleges Grid */}
      <CollegesGrid colleges={initialColleges} />

      {/* Section 7 ── Learning for Career Excellence Banner (SRM-style background design) */}
      <CareerExcellenceBanner />

      {/* Section 8 ── Admission Chances CTA Banner */}
      <AdmissionBanner />

      {/* Section 8 ── College Rankings (NIRF / Multi-Agency Compare) */}
      <RankingsCompare />

      {/* Section 9 ── Newsletter/Alerts Banner */}
      <NewsletterBanner />

      {/* Section 10 ── Why Choose C2Talents Cards */}
      <WhyChooseUs />

      {/* Section 11 ── Top Study Destinations (Cities) */}
      <TopDestinations />

      {/* Section 11 ── Explore Courses by Level */}
      <ExploreCourses />

      {/* Section 13 ── Top Exams Corner */}
      <TopExams />



      {/* Section 16 ── Study Abroad Countries */}
      <StudyAbroad />

      {/* Section 17 ── Trending Course Tags */}
      <TrendingTags />

      {/* Floating scroll-progress button */}
      <ScrollToTopButton />
    </div>
  );
}
