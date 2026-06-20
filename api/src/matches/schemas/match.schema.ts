import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MatchDocument = HydratedDocument<Match>;

export type HomeAway = 'home' | 'away';

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, trim: true })
  opponent: string;

  @Prop({ required: true, default: () => new Date() })
  date: Date;

  @Prop({ enum: ['home', 'away'] })
  homeAway?: HomeAway;

  @Prop({ trim: true })
  competition?: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
