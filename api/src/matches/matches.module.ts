import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesService } from '@/matches/matches.service';
import { MatchesController } from '@/matches/matches.controller';
import { Match, MatchSchema } from '@/matches/schemas/match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MongooseModule],
})
export class MatchesModule {}
