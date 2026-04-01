import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ResponseMessage('Search results retrieved successfully')
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.search(query, limit ? parseInt(limit, 10) : 5);
  }
}
