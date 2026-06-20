import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type StatEntryDocument = HydratedDocument<StatEntry>;

/**
 * A single contribution to a player's record. Usually one entry per player
 * per match, but the model doesn't enforce that — multiple entries simply
 * accumulate in the leaderboard totals.
 */
@Schema({ timestamps: true })
export class StatEntry {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Player',
    required: true,
    index: true,
  })
  player: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Match' })
  match?: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  goals: number;

  @Prop({ default: 0, min: 0 })
  assists: number;

  @Prop({ default: false })
  manOfTheMatch: boolean;

  @Prop({ default: 0, min: 0 })
  yellowCards: number;

  @Prop({ default: 0, min: 0 })
  redCards: number;

  @Prop({ trim: true })
  note?: string;
}

export const StatEntrySchema = SchemaFactory.createForClass(StatEntry);
