import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserAiConfigEntity } from './entities/user-ai-config.entity'
import { AiService } from './ai.service'
import { AiController } from './ai.controller'

// AI 中转模块 - 私有大模型 API 转发、密钥临时缓存、调用失败分级重试
@Module({
  imports: [TypeOrmModule.forFeature([UserAiConfigEntity])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
