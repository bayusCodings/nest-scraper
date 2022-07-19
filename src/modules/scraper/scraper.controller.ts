import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';

@Controller('scrape')
export class ScraperController {
  constructor(private readonly service: ScraperService) {}

  @Get()
  @ApiOperation({ summary: 'Scrape popular links from website' })
  scrapeWebsite(@Query('page') page: string) {
    const pageNumber = typeof page === 'undefined' ? 1 : Number(page)
    return this.service.scrapeWebsiteLinks(pageNumber);
  }
}
