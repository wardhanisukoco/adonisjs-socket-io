import { Server, Namespace } from 'socket.io'
import type { LoggerService, HttpServerService } from '@adonisjs/core/types'
import { SocketConfig } from './socket_config.js'

export class SocketManager {
  #logger: LoggerService
  #http: HttpServerService
  private _io: Server | null = null
  private channels = new Array<string>()
  private namespaces = new Map<string, Namespace>()

  constructor(
    public config: SocketConfig,
    logger: LoggerService,
    http: HttpServerService
  ) {
    this.#logger = logger
    this.#http = http
    // this.#app = app
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
    }

    this.channels.forEach((name) => {
      this.registerChannel(name)
    })
  }
  public get booted(): boolean {
    return this._io !== null
  }
  public get io(): Server {
    if (!this._io) throw new Error('SocketManager not booted')
    return this._io
  }
  public channel(channelName: string) {
    if (this.channels.includes(channelName)) {
      this.#logger.info(`socket.io already registered channel: ${channelName}`)
      return
    }
    this.channels.push(channelName)
  }
  public registerChannel(channelName: string): Namespace {
    const namespaceName = `/${channelName}`

    if (this.namespaces.has(namespaceName)) {
      this.#logger.info(`socket.io already registered channel: ${channelName}`)
      return this.namespaces.get(namespaceName)!
    }

    const namespace = this.io.of(namespaceName)
    this.namespaces.set(namespaceName, namespace)
    this.#logger.info(`socket.io already registered channel: ${channelName}`)
    return namespace
  }

  public broadcast(channelName: string, roomId: any, content: any) {
    const namespaceName = `/${channelName}`
    this.io.of(namespaceName).to(`room_${roomId}`).emit('received', content)
  }
}
