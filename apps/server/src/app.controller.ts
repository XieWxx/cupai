import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

// 根控制器 - 健康检查与基础信息
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 健康检查接口
  @Get('health')
  getHealth() {
    return this.appService.getHealth()
  }

  // 平台基础信息
  @Get('info')
  getInfo() {
    return this.appService.getInfo()
  }
}
