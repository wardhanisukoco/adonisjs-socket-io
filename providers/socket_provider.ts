import { SocketManager } from '../src/socket_manager.js'
import type { ApplicationService } from '@adonisjs/core/types'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    socket: SocketManager
  }
}

export class SocketProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton('socket', () => new SocketManager(this.app))
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    // this.app.container.make('socket')
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    const socket = await this.app.container.make('socket')
    socket.boot()
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    const socket = await this.app.container.make('socket')
    socket.io.close()
  }
}

export default SocketProvider
