interface Pagination {
  page: number,
  offset: number
  prev: string
  next: string
}

export interface ScraperResponse {
  links: string[];
  pagination: Pagination
}
