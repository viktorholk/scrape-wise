import { chromium, Browser, Page } from "playwright";
import { sendWsMessageToUser } from "./websocket";

import { EventEmitter } from 'events';
import { CrawlerJobStatus, prisma } from "@packages/database";
import { analyseResults } from "@/lib/analyser";

export async function executeCrawlAndUpdateJob({ userId, jobId, url, prompt, settings }: CrawlerProps) {
  try {
    console.log(`Starting crawl for job ID: ${jobId}, URL: ${url}`);
    const result = await crawl({
      userId,
      jobId,
      url,
      prompt,
      settings
    });

    await prisma.crawlerJob.update({
      where: { id: jobId },
      data: {
        results: result.results as any,
        status: result.status,
      },
    });
    console.log(`Crawl job ID: ${jobId} completed successfully.`);


    if (result.results.length > 0) {
      const analysis = await analyseResults(prompt, result.results);
      console.log(JSON.stringify(analysis, null, 2));
    }

  } catch (error: any) {
    console.error(`Error during crawl for job ID: ${jobId}:`, error);
    await prisma.crawlerJob.update({
      where: { id: jobId },
      data: {
        status: CrawlerJobStatus.ERROR,
        results: { error: error.message, details: error.stack } as any,
      },
    });
  }
}



export const eventEmitter = new EventEmitter();

function normalizeHostname(hostname: string): string {
  return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
}

export interface CrawlerProps {
  url: string;
  userId: number;
  jobId: number;
  prompt: string;
  settings: {
    depth: number;
    limit: number;
  }
}

export interface ScrapedPageData {
  url: string;
  title: string;
  textContent: string | null;
  linksFound: number;
  error?: string;
}


interface CrawlResult {
  url: string;
  results: ScrapedPageData[];
  status: CrawlerJobStatus;
  error?: string;
}

export async function crawl(
  { userId, jobId, url: initialUrlString, settings }: CrawlerProps,
): Promise<CrawlResult> {
  let initialUrlObj;
  try {

    if (!initialUrlString.startsWith('http://') && !initialUrlString.startsWith('https://')) {
      initialUrlString = `https://${initialUrlString}`;
    }

    initialUrlObj = new URL(initialUrlString);
  } catch (e: any) {
    console.error(`Invalid initial URL: ${initialUrlString} - ${e.message}`);
    return { url: initialUrlString, results: [], status: CrawlerJobStatus.ERROR, error: `Invalid initial URL: ${e.message}` };
  }
  const hostname= normalizeHostname(initialUrlObj.hostname);

  let stopFlag = false;

  // Listen to events
  eventEmitter.on(`${jobId}_crawler_job_stop`, (jobId: number) => {
    console.log(`Job ${jobId} stopped`); 
    stopFlag = true;
  });

  const browser: Browser = await chromium.launch();
  const context = await browser.newContext({});
  await context.route("**/*", (route) => {
    if (["image", "stylesheet", "font"].includes(route.request().resourceType())) {
      return route.abort();
    }
    return route.continue();
  });

  const visitedUrls = new Set<string>();
  const queue: { url: string; currentDepth: number }[] = [{ url: initialUrlString, currentDepth: 0 }];
  const scrapedData: ScrapedPageData[] = [];

  sendWsMessageToUser(userId, {
    type: "crawler_started",
    jobId
  });

  while (queue.length > 0 && scrapedData.length < settings.limit) {

    if (stopFlag) {
      console.log(`Job ${jobId} stopped`); 

      return { url: initialUrlString, results: scrapedData, status: CrawlerJobStatus.STOPPED };
    }

    const current = queue.shift();
    if (!current) continue;

    const { url, currentDepth } = current;

    if (visitedUrls.has(url) || currentDepth > settings.depth) {
      continue;
    }

    visitedUrls.add(url);
    let page: Page | null = null;

    try {
      sendWsMessageToUser(userId, {
        type: "crawler_job_progress",
        jobId,
        data: {
          url,
          currentDepth
        }
      });

      page = await context.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const title = await page.title();
      const textContent = await page.evaluate(() => document.body?.innerText || "");

      console.log(`count: ${scrapedData.length} depth: ${currentDepth} url: ${url} title: ${title}`);

      let linksFoundOnPageCount = 0;
      if (currentDepth < settings.depth) {
        const hrefs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("a[href]")).map(a => (a as HTMLAnchorElement).href);
        });

        for (const href of hrefs) {
          try {
            const absoluteUrl = new URL(href, url).toString();
            const newUrlObj = new URL(absoluteUrl);

            if (normalizeHostname(newUrlObj.hostname) === hostname && 
                (absoluteUrl.startsWith("http://") || absoluteUrl.startsWith("https://")) &&
                !visitedUrls.has(absoluteUrl) &&
                !queue.some(qItem => qItem.url === absoluteUrl)) {
              linksFoundOnPageCount++;
              queue.push({ url: absoluteUrl, currentDepth: currentDepth + 1 });
            }
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      }
      scrapedData.push({ url, title, textContent, linksFound: linksFoundOnPageCount });

    } catch (error: any) {
      console.error(`Failed to process ${url}: ${error.message}`);
      scrapedData.push({ url, title: "", textContent: null, linksFound: 0, error: error.message });

      sendWsMessageToUser(userId, {
        type: "crawler_job_progress_error",
        jobId,
        data: {
          url,
          error: error.message
        }
      });
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  sendWsMessageToUser(userId, {
    type: "crawler_job_finished",
    jobId,
  });

  await browser.close();
  return { url: initialUrlString, results: scrapedData, status: CrawlerJobStatus.COMPLETED };
}





