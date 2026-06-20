import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ trim: true })
  position?: string;

  @Prop({ min: 0, max: 99 })
  jerseyNumber?: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
