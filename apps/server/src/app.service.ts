import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  // 健康检查
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }

  // 平台基础信息
  getInfo() {
    return {
      name: 'CupAI',
      version: '0.1.0',
      description: '世界杯自定义 AI 赛事分析预测平台',
      apiVersion: 'v1',
    }
  }
}
