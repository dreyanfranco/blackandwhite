import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI',
          'mongodb://127.0.0.1:27017/blackandwhite',
        ),
      }),
    }),
    PlayersModule,
    MatchesModule,
    StatsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
