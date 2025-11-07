import { LoggerService } from '@adonisjs/core/types'
import { Namespace, Socket } from 'socket.io'
/**
 * Helper class that wraps the Namespace
 */
export class SocketChannel {
  #logger: LoggerService
  #namespace: Namespace | null = null
  #middlewares: ((socket: Socket, next: (err?: Error) => void) => void | Promise<void>)[] = []
  #listeners: Map<string, ((socket: Socket, ...args: any[]) => void | Promise<void>)[]> = new Map()

  constructor(
    public channelName: string,
    logger: LoggerService
  ) {
    this.#logger = logger
  }
  get namespace(): Namespace {
    if (!this.#namespace) throw new Error('SocketChannel namespace not set')
    return this.#namespace
  }
  setNamespace(namespace: Namespace): this {
    this.setupHandlers(namespace)
    this.#namespace = namespace
    return this
  }
  private setupListeners(socket: Socket) {
    for (const [event, listeners] of this.#listeners) {
      listeners.forEach((listener) => {
        socket.on(event, listener)
      })
    }
  }
  private setupMiddlewares(namespace: Namespace) {
    this.#middlewares.forEach((middleware) => {
      namespace?.use(middleware)
    })
  }
  private setupHandlers(namespace: Namespace): void {
    namespace.on('connection', (socket) => {
      socket.on('subscribe', (identifier) => {
        socket.join(identifier)
        this.#logger.info(`socket.io ${socket.id} joined ${this.channelName}:${identifier}`)
        this.setupListeners(socket)
      })
      socket.on('unsubscribe', (identifier) => {
        socket.leave(identifier)
        this.#logger.info(`socket.io ${socket.id} left ${this.channelName}:${identifier}`)
      })
    })
    this.setupMiddlewares(namespace)
  }
  use(fn: (socket: Socket, next: (err?: Error) => void) => void | Promise<void>) {
    this.#middlewares.push(fn)
    return this
  }
  on(event: string, listener: (socket: Socket, ...args: any[]) => void | Promise<void>): this {
    if (!this.#listeners.has(event)) this.#listeners.set(event, [listener])
    this.#listeners.get(event)?.push(listener)
    return this
  }
}
