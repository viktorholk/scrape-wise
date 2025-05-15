import { JobStatus } from "@packages/database";

export interface CrawlerSettings {
    depth: number;
    limit: number;
}
export interface ScrapedPageData {
    url: string;
    title: string;
    textContent: string | null;
    linksFound: number;
    error?: string;
}

export interface CrawlResult {
    url: string;
    pages: ScrapedPageData[];
    status: JobStatus;
    error?: string;
}