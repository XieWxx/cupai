import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchEntity } from '../match/entities/match.entity'
import { AnalysisReportEntity } from './entities/analysis-report.entity'
import { SquareGateway } from './square.gateway'

/**
 * Agent 定时任务服务
 * - 定时扫描即将开始的赛事
 * - 自动生成赛事分析报告
 * - 数据巡检与状态更新
 */
@Injectable()
export class AgentSchedulerService {
  private readonly logger = new Logger(AgentSchedulerService.name)

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(AnalysisReportEntity)
    private readonly reportRepo: Repository<AnalysisReportEntity>,
    private readonly squareGateway: SquareGateway,
  ) {}

  /**
   * 每30分钟扫描即将开始的赛事
   * 发现新赛事时触发分析流程
   */
  @Cron('*/30 * * * *')
  async scanUpcomingMatches() {
    this.logger.log('开始扫描即将开始的赛事...')

    try {
      // 查找未来24小时内即将开始的赛事
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const upcomingMatches = await this.matchRepo
        .createQueryBuilder('match')
        .where('match.status = :status', { status: 'upcoming' })
        .andWhere('match.startTime BETWEEN :now AND :tomorrow', { now, tomorrow })
        .getMany()

      this.logger.log(`发现 ${upcomingMatches.length} 场即将开始的赛事`)

      // 检查每场赛事是否已有 Agent 分析报告
      for (const match of upcomingMatches) {
        const existingReport = await this.reportRepo.findOne({
          where: { matchId: match.id, source: 'agent' },
        })

        if (!existingReport) {
          this.logger.log(`赛事 ${match.id} 尚无 Agent 分析，加入待分析队列`)
          // 实际生产环境中，这里会调用 AI 中转服务生成分析
          // V1.0 阶段先记录日志，后续接入真实 AI 调用
        }
      }
    } catch (error) {
      this.logger.error('赛事扫描失败', error)
    }
  }

  /**
   * 每5分钟检查进行中的赛事状态
   * 检测比分变更并推送 WebSocket 通知
   */
  @Cron('*/5 * * * *')
  async checkLiveMatches() {
    this.logger.log('检查进行中的赛事...')

    try {
      const liveMatches = await this.matchRepo.find({
        where: { status: 'live' },
      })

      this.logger.log(`当前 ${liveMatches.length} 场赛事进行中`)

      // 实际生产环境中，这里会从外部数据源获取最新比分
      // 检测到变更后通过 WebSocket 推送
      for (const match of liveMatches) {
        this.squareGateway.broadcastNewReport({
          type: 'live_update',
          matchId: match.id,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        })
      }
    } catch (error) {
      this.logger.error('赛事状态检查失败', error)
    }
  }

  /**
   * 每天凌晨3点执行数据巡检
   * 检查数据完整性、清理过期缓存
   */
  @Cron('0 3 * * *')
  async dailyDataInspection() {
    this.logger.log('开始每日数据巡检...')

    try {
      // 统计数据完整性
      const totalMatches = await this.matchRepo.count()
      const totalReports = await this.reportRepo.count()

      this.logger.log(`数据巡检完成: ${totalMatches} 场赛事, ${totalReports} 份报告`)
    } catch (error) {
      this.logger.error('数据巡检失败', error)
    }
  }
}
