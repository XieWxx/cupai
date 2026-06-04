import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

/**
 * 赛事实时推送 WebSocket 网关
 * 支持赛事状态更新、比分变更、积分榜刷新等实时推送
 */
@WebSocketGateway({
  cors: {
    origin: '*', // 生产环境需限制域名
    credentials: true,
  },
  namespace: '/match',
})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  // 在线连接数
  private connectedClients = 0

  /**
   * 客户端连接
   */
  handleConnection(client: Socket) {
    this.connectedClients++
    console.log(`[WebSocket] 客户端连接: ${client.id}，当前在线: ${this.connectedClients}`)
  }

  /**
   * 客户端断开
   */
  handleDisconnect(client: Socket) {
    this.connectedClients--
    console.log(`[WebSocket] 客户端断开: ${client.id}，当前在线: ${this.connectedClients}`)
  }

  /**
   * 订阅特定赛事
   */
  @SubscribeMessage('subscribe:match')
  handleSubscribeMatch(client: Socket, matchId: string) {
    client.join(`match:${matchId}`)
    console.log(`[WebSocket] 客户端 ${client.id} 订阅赛事: ${matchId}`)
  }

  /**
   * 取消订阅赛事
   */
  @SubscribeMessage('unsubscribe:match')
  handleUnsubscribeMatch(client: Socket, matchId: string) {
    client.leave(`match:${matchId}`)
  }

  /**
   * 推送赛事状态更新（供 Service 调用）
   */
  broadcastMatchUpdate(matchId: string, data: Record<string, unknown>) {
    this.server.to(`match:${matchId}`).emit('match:update', {
      matchId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 推送比分变更
   */
  broadcastScoreChange(matchId: string, homeScore: number, awayScore: number) {
    this.server.to(`match:${matchId}`).emit('match:score', {
      matchId,
      homeScore,
      awayScore,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 推送全局赛事状态变更（如比赛开始/结束）
   */
  broadcastMatchStatusChange(matchId: string, status: string) {
    this.server.emit('match:status', {
      matchId,
      status,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 推送积分榜更新
   */
  broadcastStandingsUpdate(data: Record<string, unknown>) {
    this.server.emit('standings:update', {
      ...data,
      timestamp: new Date().toISOString(),
    })
  }
}
