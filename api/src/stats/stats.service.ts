import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { StatEntry, StatEntryDocument } from '@/stats/schemas/stat-entry.schema';
import { Player, PlayerDocument } from '@/players/schemas/player.schema';
import { Match, MatchDocument } from '@/matches/schemas/match.schema';
import { CreateStatDto } from '@/stats/dto/create-stat.dto';

export type LeaderboardField =
  | 'goals'
  | 'assists'
  | 'manOfTheMatch'
  | 'yellowCards'
  | 'redCards'
  | 'appearances';

const SORTABLE: LeaderboardField[] = [
  'goals',
  'assists',
  'manOfTheMatch',
  'yellowCards',
  'redCards',
  'appearances',
];

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(StatEntry.name)
    private readonly statModel: Model<StatEntryDocument>,
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,
  ) {}

  async create(dto: CreateStatDto): Promise<StatEntry> {
    const player = await this.playerModel.exists({ _id: dto.player });
    if (!player) {
      throw new BadRequestException(`Player ${dto.player} does not exist`);
    }
    if (dto.match) {
      const match = await this.matchModel.exists({ _id: dto.match });
      if (!match) {
        throw new BadRequestException(`Match ${dto.match} does not exist`);
      }
    }
    return this.statModel.create(dto);
  }

  /** Stat entries, newest first. Optionally filtered to one player. */
  findAll(playerId?: string): Promise<StatEntry[]> {
    const filter =
      playerId && isValidObjectId(playerId) ? { player: playerId } : {};
    return this.statModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('player', 'name position jerseyNumber')
      .populate('match', 'opponent date homeAway competition')
      .exec();
  }

  /**
   * Aggregated totals per player. Every player appears, even with no entries,
   * so this doubles as the roster-with-stats view.
   */
  async leaderboard(sortBy: LeaderboardField = 'goals') {
    const sortField = SORTABLE.includes(sortBy) ? sortBy : 'goals';
    return this.playerModel.aggregate([
      {
        $lookup: {
          from: this.statModel.collection.name,
          localField: '_id',
          foreignField: 'player',
          as: 'entries',
        },
      },
      {
        $addFields: {
          goals: { $sum: '$entries.goals' },
          assists: { $sum: '$entries.assists' },
          yellowCards: { $sum: '$entries.yellowCards' },
          redCards: { $sum: '$entries.redCards' },
          manOfTheMatch: {
            $sum: {
              $map: {
                input: '$entries',
                as: 'e',
                in: { $cond: ['$$e.manOfTheMatch', 1, 0] },
              },
            },
          },
          appearances: { $size: '$entries' },
        },
      },
      {
        $project: {
          _id: 0,
          playerId: '$_id',
          name: 1,
          position: 1,
          jerseyNumber: 1,
          goals: 1,
          assists: 1,
          manOfTheMatch: 1,
          yellowCards: 1,
          redCards: 1,
          appearances: 1,
        },
      },
      { $sort: { [sortField]: -1, name: 1 } },
    ]);
  }

  async remove(id: string): Promise<void> {
    if (!isValidObjectId(id)) return;
    await this.statModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
  }
}
