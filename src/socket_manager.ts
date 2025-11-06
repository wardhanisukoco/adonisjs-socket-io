import { Server } from 'socket.io'
import type { LoggerService, HttpServerService } from '@adonisjs/core/types'
import { SocketConfig } from './socket_config.js'
import { SocketChannel } from './socket_channel.js'

export class SocketManager {
  #logger: LoggerService
  #http: HttpServerService
  private _io: Server | null = null
  private channels = new Array<string>()
  private namespaces = new Map<string, SocketChannel>()

  constructor(
    public config: SocketConfig,
    logger: LoggerService,
    http: HttpServerService
  ) {
    this.#logger = logger
    this.#http = http
  }

  public async boot() {
    if (this._io) return
    const server = this.#http.getNodeServer()

    this._io = new Server(server, this.config.socketIoOptions)

    if (server && this._io) {
      const PORT = process.env.PORT || 3333
      this.#logger.info(`socket.io listening on port ${PORT}`)
    } else {
      this.#logger.warn('socket.io HTTP server is not available, skipping listen')
      return
    }

    this.channels.forEach((name) => {
      this.namespaces.get(`/${name}`)?.setNamespace(this.io.of(`/${name}`))
    })
  }
  public get booted(): boolean {
    return this._io !== null
  }
  public get io(): Server {
    if (!this._io) throw new Error('SocketManager not booted')
    return this._io
  }
  public channel(channelName: string): SocketChannel {
    if (!this._io) {
      this.#logger.warn(`socket.io not initialized, channel ${channelName} will not be registered`)
      this.channels.push(channelName)
      return new SocketChannel(channelName)
    }
    const namespaceName = `/${channelName}`

    if (this.namespaces.has(namespaceName)) {
      this.#logger.info(`socket.io already registered channel: ${channelName}`)
      return this.namespaces.get(namespaceName)!
    }

    const namespace = this.io.of(namespaceName)
    const channel = new SocketChannel(channelName).setNamespace(namespace)
    this.namespaces.set(namespaceName, channel)
    this.#logger.info(`socket.io register channel: ${channelName}`)

    namespace.on('connection', (socket) => {
      socket.on('subscribe', (roomName) => {
        socket.join(roomName)
        this.#logger.info(`socket.io ${socket.id} joined ${namespaceName}:${roomName}`)
      })
      socket.on('unsubscribe', (roomName) => {
        socket.leave(roomName)
        this.#logger.info(`socket.io ${socket.id} left ${namespaceName}:${roomName}`)
      })
      socket.on('message', (data) => {
        this.broadcast(channelName, socket.id, data)
      })
    })
    return channel
  }

  public broadcast(channelName: string, roomId: any, content: any) {
    const namespaceName = `/${channelName}`
    this.io.of(namespaceName).to(`room_${roomId}`).emit('received', content)
  }
}
