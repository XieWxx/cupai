import { Controller, Get, Post, Put } from '@nestjs/common'
import { BsdcSyncService } from './bsd-sync.service'

@Controller('bsd/sync')
export class BsdcSyncController {
  constructor(private readonly syncService: BsdcSyncService) {}

  @Get('status')
  async getSyncStatus() {
    return this.syncService.getSyncStatus()
  }

  @Post('teams')
  async syncTeams() {
    return this.syncService.syncTeams()
  }

  @Post('events')
  async syncEvents() {
    return this.syncService.syncEvents()
  }

  @Post('standings')
  async syncStandings() {
    return this.syncService.syncStandings()
  }

  @Post('full')
  async syncFull() {
    const teams = await this.syncService.syncTeams()
    const events = await this.syncService.syncEvents()
    const standings = await this.syncService.syncStandings()
    return { teams, events, standings }
  }
}
