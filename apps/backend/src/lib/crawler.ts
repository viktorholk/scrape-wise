import { chromium, Browser, Page } from "playwright";
import { sendWsMessageToUser } from "./websocket";

import { EventEmitter } from 'events';
import { CrawlerJob, JobStatus, prisma } from "@packages/database";

import { CrawlerSettings, CrawlResult, ScrapedPageData } from "@/types";

export const eventEmitter = new EventEmitter();

function normalizeHostname(hostname: string): string {
  return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
}

export async function createCrawlJob(userId: number, url: string, settings: CrawlerSettings): Promise<CrawlerJob> {
  const job = await prisma.crawlerJob.create({
    data: {
      userId,
      initialUrl: url,
      crawlDepth: settings.depth,
      pageLimit: settings.limit,
      status: JobStatus.STARTED,
    }
  });

  const result = await crawl(userId, job.id, url, settings);

  const updatedJob = await prisma.crawlerJob.update({
    where: { id: job.id },
    data: {
      status: result.status,
      pages: result.pages as any,
    }
  });

  return updatedJob;
}

export async function crawl(
  userId: number,
  jobId: number,
  initialUrlString: string,
  settings: CrawlerSettings,
): Promise<CrawlResult> {
  let initialUrlObj;
  try {

    if (!initialUrlString.startsWith('http://') && !initialUrlString.startsWith('https://')) {
      initialUrlString = `https://${initialUrlString}`;
    }

    initialUrlObj = new URL(initialUrlString);
  } catch (e: any) {
    console.error(`Invalid initial URL: ${initialUrlString} - ${e.message}`);
    return { url: initialUrlString, pages: [], status: JobStatus.ERROR, error: `Invalid initial URL: ${e.message}` };
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

  await sendWsMessageToUser(userId, {
    type: "crawler_job_started",
    jobId
  });

  while (queue.length > 0 && scrapedData.length < settings.limit) {

    if (stopFlag) {
      console.log(`Job ${jobId} stopped`); 

      return { url: initialUrlString, pages: scrapedData, status: JobStatus.STOPPED };
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
      await sendWsMessageToUser(userId, {
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

      await sendWsMessageToUser(userId, {
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

  await sendWsMessageToUser(userId, {
    type: "crawler_job_finished",
    jobId,
  });

  // cleanup
  await browser.close();
  eventEmitter.removeAllListeners(`${jobId}_crawler_job_stop`);

  return { url: initialUrlString, pages: scrapedData, status: JobStatus.COMPLETED };
}





