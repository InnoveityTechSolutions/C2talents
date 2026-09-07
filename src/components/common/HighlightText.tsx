"use client";

import * as React from "react";

export interface HighlightTextProps {
  text: string | null | undefined;
  query: string | null | undefined;
  className?: string;
  highlightClassName?: string;
  style?: React.CSSProperties;
  highlightStyle?: React.CSSProperties;
}

/**
 * Safely renders text with matching search query tokens highlighted in ORANGE (#F97316).
 * Avoids dangerouslySetInnerHTML to prevent XSS vulnerabilities.
 * Supports multi-word queries, partial substring matches, and prefix matching.
 */
export function HighlightText({
  text,
  query,
  className = "",
  highlightClassName = "",
  style,
  highlightStyle = { color: "#F97316", fontWeight: 700 },
}: HighlightTextProps) {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className} style={style}>{text}</span>;
  }

  const rawQuery = query.trim();
  const lowerText = text.toLowerCase();

  // Extract individual search tokens
  const tokens = Array.from(
    new Set(
      rawQuery
        .split(/\s+/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
    )
  );

  if (tokens.length === 0) {
    return <span className={className} style={style}>{text}</span>;
  }

  const rawRanges: Array<[number, number]> = [];

  // 1. Literal Substring Matches for each token
  for (const token of tokens) {
    let pos = 0;
    while ((pos = lowerText.indexOf(token, pos)) !== -1) {
      rawRanges.push([pos, pos + token.length]);
      pos += 1;
    }
  }

  // 2. Prefix & Sub-token overlap match (handles typos like "annamalaiya" vs "Annamalai")
  for (const token of tokens) {
    if (token.length >= 3) {
      // Find words in text
      const wordRegex = /[a-zA-Z0-9]+/g;
      let match: RegExpExecArray | null;
      while ((match = wordRegex.exec(text)) !== null) {
        const word = match[0];
        const wordStart = match.index;
        const wordEnd = wordStart + word.length;
        const lowerWord = word.toLowerCase();

        if (lowerWord.length >= 3) {
          // Case A: Token starts with word (e.g. query "annamalaiya", word "Annamalai")
          if (token.startsWith(lowerWord)) {
            rawRanges.push([wordStart, wordEnd]);
          }
          // Case B: Word starts with token (e.g. query "annama", word "Annamalai")
          else if (lowerWord.startsWith(token)) {
            rawRanges.push([wordStart, wordStart + token.length]);
          }
          // Case C: Shared prefix >= 3 chars
          else {
            let sharedLen = 0;
            const minLen = Math.min(token.length, lowerWord.length);
            while (sharedLen < minLen && token[sharedLen] === lowerWord[sharedLen]) {
              sharedLen++;
            }
            if (sharedLen >= 3 && (sharedLen >= lowerWord.length * 0.7 || sharedLen >= token.length * 0.7)) {
              rawRanges.push([wordStart, wordStart + sharedLen]);
            }
          }
        }
      }
    }
  }

  if (rawRanges.length === 0) {
    return <span className={className} style={style}>{text}</span>;
  }

  // 3. Merge overlapping or adjacent ranges
  rawRanges.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]));

  const mergedRanges: Array<[number, number]> = [];
  let currentRange = rawRanges[0];

  for (let i = 1; i < rawRanges.length; i++) {
    const nextRange = rawRanges[i];
    if (nextRange[0] <= currentRange[1]) {
      currentRange[1] = Math.max(currentRange[1], nextRange[1]);
    } else {
      mergedRanges.push(currentRange);
      currentRange = nextRange;
    }
  }
  mergedRanges.push(currentRange);

  // 4. Construct React Element Segments
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  mergedRanges.forEach(([start, end], idx) => {
    if (start > lastIndex) {
      elements.push(
        <React.Fragment key={`text-${lastIndex}`}>
          {text.slice(lastIndex, start)}
        </React.Fragment>
      );
    }

    const matchedSegment = text.slice(start, end);
    elements.push(
      <span
        key={`highlight-${start}-${idx}`}
        style={{ color: "#F97316", fontWeight: 700, ...highlightStyle }}
        className={`search-highlight ${highlightClassName}`}
      >
        {matchedSegment}
      </span>
    );

    lastIndex = end;
  });

  if (lastIndex < text.length) {
    elements.push(
      <React.Fragment key={`text-${lastIndex}`}>
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return (
    <span className={className} style={style}>
      {elements}
    </span>
  );
}

// Export alias for requirement #9: <HighlightedText text={...} query={...} />
export const HighlightedText = HighlightText;
