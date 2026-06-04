import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamEntity } from './entities/team.entity'
import { PlayerEntity } from './entities/player.entity'
import { MatchEntity } from './entities/match.entity'
import { GroupStandingEntity } from './entities/group-standing.entity'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import { MatchCacheService } from './match-cache.service'
import { StandingService } from './standing.service'

// 赛事数据模块 - 球队、球星、历史赛果、实时动态、环境数据、积分榜
@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, PlayerEntity, MatchEntity, GroupStandingEntity])],
  controllers: [MatchController],
  providers: [MatchService, MatchGateway, MatchCacheService, StandingService],
  exports: [MatchService, MatchGateway, MatchCacheService, StandingService],
})
export class MatchModule {}
