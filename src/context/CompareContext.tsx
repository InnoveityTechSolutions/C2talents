"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompareCollege {
  id: string;
  name: string;
  location: string;
  rating: number;
  type: string;
  naacGrade?: string | null;
  nirfRank?: number | null;
  feesPerYear: number;
  avgPackage: number;
  highestPackage: number;
  image: string;
}

interface CompareContextType {
  selectedColleges: CompareCollege[];
  toggleCollege: (college: CompareCollege) => void;
  addCollege: (college: CompareCollege) => void;
  removeCollege: (id: string) => void;
  clearCompare: () => void;
  isSelected: (id: string) => boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedColleges, setSelectedColleges] = useState<CompareCollege[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("c2talents_compare_colleges");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedColleges(parsed);
          if (parsed.length > 0) {
            setIsOpen(true);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load compare items from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("c2talents_compare_colleges", JSON.stringify(selectedColleges));
    } catch (e) {
      console.error("Failed to save compare items to localStorage", e);
    }
  }, [selectedColleges, isInitialized]);

  const addCollege = (college: CompareCollege) => {
    setSelectedColleges((prev) => {
      if (prev.some((c) => c.id === college.id)) return prev;
      if (prev.length >= 4) {
        alert("You can compare a maximum of 4 colleges at a time.");
        return prev;
      }
      return [...prev, college];
    });
    setIsOpen(true);
  };

  const removeCollege = (id: string) => {
    setSelectedColleges((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCollege = (college: CompareCollege) => {
    if (selectedColleges.some((c) => c.id === college.id)) {
      removeCollege(college.id);
    } else {
      addCollege(college);
    }
  };

  const clearCompare = () => {
    setSelectedColleges([]);
  };

  const isSelected = (id: string) => {
    return selectedColleges.some((c) => c.id === id);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedColleges,
        toggleCollege,
        addCollege,
        removeCollege,
        clearCompare,
        isSelected,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
