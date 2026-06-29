import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from '@/stats/stats.service';
import type { LeaderboardField } from '@/stats/stats.service';
import { CreateStatDto } from '@/stats/dto/create-stat.dto';
import { TeamPinGuard } from '@/common/team-pin.guard';

@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('leaderboard')
  leaderboard(@Query('sort') sort?: LeaderboardField) {
    return this.statsService.leaderboard(sort);
  }

  @Get('stats')
  findAll(@Query('player') player?: string) {
    return this.statsService.findAll(player);
  }

  @Post('stats')
  @UseGuards(TeamPinGuard)
  create(@Body() dto: CreateStatDto) {
    return this.statsService.create(dto);
  }

  @Delete('stats/:id')
  @UseGuards(TeamPinGuard)
  remove(@Param('id') id: string) {
    return this.statsService.remove(id);
  }
}
