import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from '@/matches/matches.service';
import { CreateMatchDto } from '@/matches/dto/create-match.dto';
import { TeamPinGuard } from '@/common/team-pin.guard';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @UseGuards(TeamPinGuard)
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }
}
