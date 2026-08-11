export interface ExtractedTable {
  headers: string[];
  rows: string[][];
  sourceUrl?: string;
}

export interface CrawledPage {
  url: string;
  title: string;
  category: string;
  text: string;
  rawHtml?: string;
  tables?: ExtractedTable[];
  lists?: string[][];
  jsonLdData?: any[];
  openGraphMeta?: Record<string, string>;
  schemaOrgMeta?: Record<string, string>;
  htmlLength: number;
}

export interface DiscoveredPdf {
  url: string;
  title: string;
  sourcePageUrl: string;
}

export interface DiscoveredImage {
  url: string;
  alt: string;
  sourceUrl: string;
  contextTag: string;
}

export interface PipelineData {
  targetUrl: string;
  domainOrigin: string;
  visitedPages: CrawledPage[];
  discoveredPdfs: DiscoveredPdf[];
  discoveredImages: DiscoveredImage[];
  crawledContentSummaryText: string;
  logs: string[];
}

