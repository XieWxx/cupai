import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchEntity } from './entities/match.entity'
import { TeamEntity } from './entities/team.entity'
import { PlayerEntity } from './entities/player.entity'

/**
 * 赛事数据服务
 */
@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
  ) {}

  // 获取赛事列表（支持按状态/阶段筛选）
  async getMatches(status?: string, stage?: string, page = 1, pageSize = 20) {
    const query = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.homeTeam', 'homeTeam')
      .leftJoinAndSelect('match.awayTeam', 'awayTeam')
      .orderBy('match.startTime', 'ASC')

    if (status) query.andWhere('match.status = :status', { status })
    if (stage) query.andWhere('match.stage = :stage', { stage })

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()

    return { list, total, page, pageSize }
  }

  // 获取赛事详情
  async getMatchDetail(matchId: string) {
    return this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['homeTeam', 'awayTeam'],
    })
  }

  // 获取所有球队
  async getTeams() {
    return this.teamRepo.find({ order: { fifaRank: 'ASC' } })
  }

  // 获取球队详情（含球员）
  async getTeamDetail(teamId: string) {
    const team = await this.teamRepo.findOne({ where: { id: teamId } })
    const players = await this.playerRepo.find({ where: { teamId } })
    return { ...team, players }
  }

  // 获取球员详情
  async getPlayerDetail(playerId: string) {
    return this.playerRepo.findOne({ where: { id: playerId }, relations: ['team'] })
  }
}
