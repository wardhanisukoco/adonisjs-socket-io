import { Server, Socket as SocketType } from 'socket.io'
import { ApplicationService } from '@adonisjs/core/types'

export class SocketManager {
  private _io: Server | null = null
  private channels: string[] = []

  constructor(private app: ApplicationService) {}

  public async boot() {
    if (this._io) return

    const logger = await this.app.container.make('logger')
    const http = await this.app.container.make('server')
    const server = http.getNodeServer()

    this._io = new Server(server, { cors: { origin: '*' } })
    this._io.on('connection', (socket: SocketType) => {
      logger.info(`socket.io client connected ${socket.id}`)

      for (const name of this.channels) {
        socket.on('subscribe', ({ channel, room }) => {
          if (channel === name) {
            socket.join(`room_${room}`)
            socket.emit('connected')
          }
        })
        socket.on('unsubscribe', ({ channel, room }) => {
          if (channel === name) {
            socket.leave(`room_${room}`)
            socket.emit('disconnected')
          }
        })
        socket.on('message', ({ room, message }) => {
          socket.to(`room_${room}`).emit('received', { message })
        })
      }

      socket.on('disconnect', () => logger.info(`socket.io client disconnected ${socket.id}`))
    })
    if (server && this._io) {
      const PORT = process.env.PORT || 3000
      logger.info(`socket.io listening on port ${PORT}`)
    } else {
      logger.warn('socket.io HTTP server is not available, skipping listen')
    }
  }

  public get io(): Server {
    if (!this._io) throw new Error('SocketManager not booted')
    return this._io
  }

  public channel(modelName: string) {
    this.channels.push(`${modelName}Channel`)
  }

  public broadcast(modelName: string, roomId: any, content: any) {
    const name = this.channels.find((channel) => channel === `${modelName}Channel`)
    if (!name) return
    this.io.to(`room_${roomId}`).emit('received', content)
  }
}
