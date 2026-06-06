import { Module, Global } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BsdcService } from './bsd.service'
import { BsdcBusinessService } from './bsd.business.service'
import { BsdcController } from './bsd.controller'
import { BsdcSyncController } from './bsd-sync.controller'
import { BsdcSyncService } from './bsd-sync.service'
import { MatchEntity } from '../match/entities/match.entity'
import { TeamEntity } from '../match/entities/team.entity'

@Global()
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([MatchEntity, TeamEntity]),
  ],
  controllers: [BsdcController, BsdcSyncController],
  providers: [BsdcService, BsdcBusinessService, BsdcSyncService],
  exports: [BsdcService, BsdcBusinessService, BsdcSyncService],
})
export class BsdcModule {}
