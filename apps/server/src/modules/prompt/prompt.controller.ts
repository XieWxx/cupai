import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PromptService } from './prompt.service'
import { CreatePromptDto } from './dto/create-prompt.dto'

/**
 * Prompt 模板控制器
 */
@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  // 创建模板（需登录）
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: { user: { id: string } }, @Body() dto: CreatePromptDto) {
    return this.promptService.create(req.user.id, dto)
  }

  // 获取个人模板（需登录）
  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyTemplates(@Req() req: { user: { id: string } }) {
    return this.promptService.getUserTemplates(req.user.id)
  }

  // 获取公开模板市场
  @Get('market')
  async getMarket(
    @Query('scene') scene?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.promptService.getPublicMarket(scene, sortBy, Number(page) || 1, Number(pageSize) || 20)
  }

  // 获取系统默认模板（新手可用）
  @Get('defaults')
  async getDefaults() {
    return this.promptService.getSystemDefaults()
  }

  // 更新模板（需登录）
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Req() req: { user: { id: string } }, @Param('id') id: string, @Body() dto: CreatePromptDto) {
    return this.promptService.update(req.user.id, id, dto)
  }

  // 设置公开/私密（需登录）
  @Put(':id/visibility')
  @UseGuards(AuthGuard('jwt'))
  async toggleVisibility(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { isPublic: boolean },
  ) {
    return this.promptService.toggleVisibility(req.user.id, id, body.isPublic)
  }

  // 删除模板（需登录）
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.promptService.delete(req.user.id, id)
  }

  // 收藏模板
  @Post(':id/collect')
  async collect(@Param('id') id: string) {
    return this.promptService.collectTemplate(id)
  }
}
