import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from '@/stats/stats.service';
import { StatsController } from '@/stats/stats.controller';
import { StatEntry, StatEntrySchema } from '@/stats/schemas/stat-entry.schema';
import { PlayersModule } from '@/players/players.module';
import { MatchesModule } from '@/matches/matches.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StatEntry.name, schema: StatEntrySchema },
    ]),
    PlayersModule,
    MatchesModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
