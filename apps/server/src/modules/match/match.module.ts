import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TeamEntity } from './entities/team.entity'
import { PlayerEntity } from './entities/player.entity'
import { MatchEntity } from './entities/match.entity'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'

// 赛事数据模块 - 球队、球星、历史赛果、实时动态、环境数据
@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, PlayerEntity, MatchEntity])],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
