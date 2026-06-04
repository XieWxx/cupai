import { io, type Socket } from 'socket.io-client'

/**
 * WebSocket 连接管理
 * 支持赛事实时更新和分析广场实时通知
 */

// Socket 实例缓存
let matchSocket: Socket | null = null
let squareSocket: Socket | null = null

/**
 * 获取赛事 WebSocket 连接
 */
export function getMatchSocket(): Socket {
  if (!matchSocket) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    matchSocket = io(`${wsUrl}/match`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    matchSocket.on('connect', () => {
      console.log('[WS] 赛事频道已连接')
    })

    matchSocket.on('disconnect', () => {
      console.log('[WS] 赛事频道已断开')
    })
  }
  return matchSocket
}

/**
 * 获取分析广场 WebSocket 连接
 */
export function getSquareSocket(): Socket {
  if (!squareSocket) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    squareSocket = io(`${wsUrl}/square`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    squareSocket.on('connect', () => {
      console.log('[WS] 广场频道已连接')
    })

    squareSocket.on('disconnect', () => {
      console.log('[WS] 广场频道已断开')
    })
  }
  return squareSocket
}

/**
 * 订阅赛事更新
 * @param matchId 赛事ID
 * @param onUpdate 更新回调
 */
export function subscribeMatch(
  matchId: string,
  onUpdate: (data: any) => void,
): () => void {
  const socket = getMatchSocket()
  socket.emit('subscribe:match', matchId)
  socket.on('match:update', onUpdate)
  socket.on('match:score', onUpdate)
  socket.on('match:status', onUpdate)

  // 返回取消订阅函数
  return () => {
    socket.emit('unsubscribe:match', matchId)
    socket.off('match:update', onUpdate)
    socket.off('match:score', onUpdate)
    socket.off('match:status', onUpdate)
  }
}

/**
 * 订阅分析广场更新
 * @param onUpdate 更新回调
 */
export function subscribeSquare(onUpdate: (data: any) => void): () => void {
  const socket = getSquareSocket()
  socket.on('report:new', onUpdate)
  socket.on('report:interaction', onUpdate)

  return () => {
    socket.off('report:new', onUpdate)
    socket.off('report:interaction', onUpdate)
  }
}

/**
 * 断开所有 WebSocket 连接
 */
export function disconnectAll() {
  matchSocket?.disconnect()
  squareSocket?.disconnect()
  matchSocket = null
  squareSocket = null
}
