import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Player, PlayerDocument } from './schemas/player.schema';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
  ) {}

  async create(dto: CreatePlayerDto): Promise<Player> {
    try {
      return await this.playerModel.create(dto);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`Player "${dto.name}" already exists`);
      }
      throw err;
    }
  }

  findAll(): Promise<Player[]> {
    return this.playerModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<PlayerDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Player ${id} not found`);
    }
    const player = await this.playerModel.findById(id).exec();
    if (!player) {
      throw new NotFoundException(`Player ${id} not found`);
    }
    return player;
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<Player> {
    await this.findOne(id);
    return this.playerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec() as Promise<Player>;
  }

  async remove(id: string): Promise<void> {
    const res = await this.findOne(id);
    await res.deleteOne();
  }
}
