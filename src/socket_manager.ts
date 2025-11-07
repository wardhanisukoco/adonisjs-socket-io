import { Server } from 'socket.io'
import type { LoggerService, HttpServerService } from '@adonisjs/core/types'
import { SocketConfig } from './socket_config.js'
import { SocketChannel } from './socket_channel.js'

export class SocketManager {
  #logger: LoggerService
  #http: HttpServerService
  #io: Server | null = null
  #channelNames = new Array<string>()
  #channels = new Map<string, SocketChannel>()

  constructor(
    public config: SocketConfig,
    logger: LoggerService,
    http: HttpServerService
  ) {
    this.#logger = logger
    this.#http = http
  }

  public async boot() {
    if (this.#io) return
    const server = this.#http.getNodeServer()

    this.#io = new Server(server, this.config.socketIoOptions)

    if (server && this.#io) {
      const PORT = process.env.PORT || 3333
      this.#logger.info(`socket.io listening on port ${PORT}`)
    } else {
      this.#logger.warn('socket.io HTTP server is not available, skipping listen')
      return
    }

    this.#channelNames.forEach((name) => {
      this.registerChannel(name)
    })
  }
  private registerChannel(name: string): SocketChannel {
    const namespaceName = `/${name}`
    if (this.#channels.has(namespaceName)) {
      this.#logger.info(`socket.io already registered channel: ${name}`)
      return this.#channels.get(namespaceName)!
    }

    const namespace = this.io.of(namespaceName)
    const channel = new SocketChannel(name, this.#logger).setNamespace(namespace)

    this.#channels.set(namespaceName, channel)
    this.#logger.info(`socket.io register channel: ${name}`)
    return channel
  }
  public get booted(): boolean {
    return this.#io !== null
  }
  public get io(): Server {
    if (!this.#io) throw new Error('SocketManager not booted')
    return this.#io
  }
  public channel(name: string): SocketChannel {
    if (!this.#io) {
      this.#channelNames.push(name)
      return new SocketChannel(name, this.#logger)
    }
    return this.registerChannel(name)
  }

  public broadcast(channelName: string, identifier: any, content: any) {
    const namespaceName = `/${channelName}`
    this.io.of(namespaceName).to(`${identifier}`).emit('received', content)
  }
}
