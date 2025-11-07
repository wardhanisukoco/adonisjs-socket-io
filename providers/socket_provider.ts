import { SocketManager } from '../src/socket_manager.js'
import type { ApplicationService } from '@adonisjs/core/types'
import { type SocketConfig } from '../src/socket_config.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    socket: SocketManager
  }
}

export default class SocketProvider {
  #socket: SocketManager | null = null
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('socket', async () => {
      const config = this.app.config.get<SocketConfig>('socket')
      const logger = await this.app.container.make('logger')
      const server = await this.app.container.make('server')
      this.#socket = new SocketManager(config, logger, server)
      return this.#socket
    })
  }

  async boot() {}

  async start() {}

  async ready() {
    await this.#socket?.boot()
  }

  async shutdown() {
    if (this.#socket) {
      this.#socket.io.removeAllListeners()
      this.#socket.io.close()
    }
  }
}
