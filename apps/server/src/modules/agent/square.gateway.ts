import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

/**
 * 分析广场实时推送网关
 * 新分析报告发布、互动更新等实时通知
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/square',
})
export class SquareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private connectedClients = 0

  handleConnection(_client: Socket) {
    this.connectedClients++
  }

  handleDisconnect(_client: Socket) {
    this.connectedClients--
  }

  /**
   * 推送新分析报告（有人发布时通知全广场）
   */
  broadcastNewReport(report: Record<string, unknown>) {
    this.server.emit('report:new', {
      ...report,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 推送报告互动更新（点赞/收藏/评论数变更）
   */
  broadcastReportInteraction(reportId: string, data: Record<string, unknown>) {
    this.server.emit('report:interaction', {
      reportId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  }
}
