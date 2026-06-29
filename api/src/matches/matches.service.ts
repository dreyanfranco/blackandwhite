import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Match, MatchDocument } from '@/matches/schemas/match.schema';
import { CreateMatchDto } from '@/matches/dto/create-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  create(dto: CreateMatchDto): Promise<Match> {
    return this.matchModel.create({
      ...dto,
      date: dto.date ? new Date(dto.date) : new Date(),
    });
  }

  findAll(): Promise<Match[]> {
    return this.matchModel.find().sort({ date: -1 }).exec();
  }

  async findOne(id: string): Promise<Match> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Match ${id} not found`);
    }
    const match = await this.matchModel.findById(id).exec();
    if (!match) {
      throw new NotFoundException(`Match ${id} not found`);
    }
    return match;
  }
}
