import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamEntity } from './entities/team.entity'
import { PlayerEntity } from './entities/player.entity'
import { MatchEntity } from './entities/match.entity'
import { GroupStandingEntity } from './entities/group-standing.entity'
import { SentimentDataEntity } from './entities/sentiment-data.entity'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import { MatchCacheService } from './match-cache.service'
import { StandingService } from './standing.service'
import { SentimentService } from './sentiment.service'
import { SentimentController } from './sentiment.controller'
import { RedisModule } from '../../config/redis.module'
import { BsdcModule } from '../bsd/bsd.module'

// 赛事数据模块 - 球队、球星、历史赛果、实时动态、环境数据、积分榜、舆情
@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity, PlayerEntity, MatchEntity, GroupStandingEntity, SentimentDataEntity]),
    RedisModule,
    BsdcModule,
  ],
  controllers: [MatchController, SentimentController],
  providers: [MatchService, MatchGateway, MatchCacheService, StandingService, SentimentService],
  exports: [MatchService, MatchGateway, MatchCacheService, StandingService, SentimentService],
})
export class MatchModule {}
