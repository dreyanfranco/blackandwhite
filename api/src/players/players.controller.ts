import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlayersService } from '@/players/players.service';
import { CreatePlayerDto } from '@/players/dto/create-player.dto';
import { UpdatePlayerDto } from '@/players/dto/update-player.dto';
import { TeamPinGuard } from '@/common/team-pin.guard';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Post()
  @UseGuards(TeamPinGuard)
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(TeamPinGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePlayerDto) {
    return this.playersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(TeamPinGuard)
  remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
