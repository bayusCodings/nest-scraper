import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiResponseDto, asApiResponse } from 'src/core/base/response.dto';
import { ScraperResponse } from './dto/scraper.output';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { DEFAULT_APP_PORT, DEFAULT_LIMIT } from 'src/core/base/constant';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ScraperService {
  private logger = new Logger(ScraperService.name);

  constructor(
    private redisService: RedisService
  ) {}

  async scrapeWebsiteLinks(pageNumber: number)
  : Promise<ApiResponseDto<ScraperResponse>> {
    const offset = DEFAULT_LIMIT * (pageNumber - 1)

    try {
      let links: string[];

      links = await this.fetchFromCache(pageNumber)
      if (!links) {
        links = await this.scrapWithPuppeteer(pageNumber, offset)
      }

      const data: ScraperResponse = {
        links,
        pagination: {
          offset,
          page: pageNumber,
          prev: pageNumber === 1 ? null : `http://localhost:${DEFAULT_APP_PORT}/scrape?page=${pageNumber - 1}`,
          next: `http://localhost:${DEFAULT_APP_PORT}/scrape?page=${(pageNumber + 1)}`
        }
      };

      return asApiResponse(data, 'successfully scraped website');
    } catch (error) {
      this.logger.error('An error occurred while scraping ' + error.message);
      throw new InternalServerErrorException(
        'An error occurred while scraping, please try again later',
      );
    }
  }

  private async fetchFromCache(pageNumber: number) {
    this.logger.debug(`Fetching via cache`)
    const result = await this.redisService.get<string[]>(`page${pageNumber}`)
    return result
  }

  private async scrapWithPuppeteer(pageNumber: number, offset: number) {
    const url: string = 'https://webflow.com/websites/popular';

    const html = await this.launchPuppeteer(url, pageNumber);
    const $ = cheerio.load(html);

    // extract <a class="css-1w630yq"> tags
    const linkObjects = $('a.css-1w630yq');
    const links = [];

    for (let i = offset; i < linkObjects.length; i++) {
      const href = $(linkObjects[i]).attr('href');// get the href attribute
      links.push(href);
    }

    // cache scraped links
    this.redisService.set<string[]>(`page${pageNumber}`, links)
    return links
  }

  private async launchPuppeteer(url: string, pageNumber: number) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 0 });

    await this.closeModal(page) // close modal box blocking the load more button
    await this.loadMore(page, pageNumber - 1)
    await page.waitForNetworkIdle()

    const html = await page.content();
    return html
  }

  private async closeModal(page: puppeteer.Page) {
    const isModalVisible = await this.isElementVisible(page, 'div[data-sc="ModalCard"]')
    if (isModalVisible) {
      await page.evaluate(() => { 
        document.querySelector<HTMLElement>('div[data-sc="ModalCard"]').style.display = 'none' 
      });
    }
  }

  private async loadMore(page: puppeteer.Page, pageNumber: number) {
    if (pageNumber === 0) return
    let numOfClick = pageNumber

    const cssSelector = '#__next > div > main > div.--styled-iaiCGv.wf-17ix3k0 > div.--styled-iaiCGv.wf-17ix3k0 > div.css-vooagt.--styled-iaiCGv.wf-17ix3k0 > div.css-1layelq > div.css-1nrgb0i > button'
    let loadMoreVisible = await this.isElementVisible(page, cssSelector)

    // make sure the button is visible and click based on the pageNumber
    while (loadMoreVisible && numOfClick > 0) {
      await page
        .click(cssSelector)
        .catch(() => {})
        
      loadMoreVisible = await this.isElementVisible(page, cssSelector)
      numOfClick--
    }
  }

  private async isElementVisible(page: puppeteer.Page, cssSelector: string) {
    let visible = true;
    await page
      .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
      .catch(() => visible = false)

    return visible
  }
}
