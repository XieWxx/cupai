import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PromptTemplateEntity } from './entities/prompt-template.entity'
import { PromptService } from './prompt.service'
import { PromptController } from './prompt.controller'

// Prompt 市场模块 - 模板创建、公开/私密管理、收藏复用、原创保护
@Module({
  imports: [TypeOrmModule.forFeature([PromptTemplateEntity])],
  controllers: [PromptController],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
