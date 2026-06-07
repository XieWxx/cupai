import { Module, Global } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BsdcService } from './bsd.service'
import { BsdcBusinessService } from './bsd.business.service'
import { BsdcController } from './bsd.controller'
import { BsdcSyncController } from './bsd-sync.controller'
import { BsdcSyncService } from './bsd-sync.service'
import { BsdcSyncScheduler } from './bsd-sync.scheduler'
import { MatchEntity } from '../match/entities/match.entity'
import { TeamEntity } from '../match/entities/team.entity'
import { GroupStandingEntity } from '../match/entities/group-standing.entity'
import { LeagueEntity } from '../match/entities/league.entity'
import { EventIncidentEntity } from '../match/entities/event-incident.entity'
import { EventLineupEntity } from '../match/entities/event-lineup.entity'
import { EventOddsEntity } from '../match/entities/event-odds.entity'
import { EventStatsEntity } from '../match/entities/event-stats.entity'
import { EventPredictionEntity } from '../match/entities/event-prediction.entity'

@Global()
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      MatchEntity,
      TeamEntity,
      GroupStandingEntity,
      LeagueEntity,
      EventIncidentEntity,
      EventLineupEntity,
      EventOddsEntity,
      EventStatsEntity,
      EventPredictionEntity,
    ]),
  ],
  controllers: [BsdcController, BsdcSyncController],
  providers: [BsdcService, BsdcBusinessService, BsdcSyncService, BsdcSyncScheduler],
  exports: [BsdcService, BsdcBusinessService, BsdcSyncService, BsdcSyncScheduler],
})
export class BsdcModule {}
