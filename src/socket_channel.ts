import { Namespace, Socket } from 'socket.io'
import { SocketMiddleware } from './socket_middleware.js'

/**
 * Helper class that wraps the Namespace
 */
export class SocketChannel {
  public namespace: Namespace | null = null
  constructor(
    public channelName: string,
    private defaultGuard: keyof SocketMiddleware | null,
    private middleware: SocketMiddleware | null
  ) {
    // 2. Automatically apply the default guard!
    if (this.defaultGuard) {
      // Check if the guard exists in the kernel

      if (this.middleware) {
        if (this.defaultGuard in this.middleware) {
          this.use(this.defaultGuard)
        } else {
          console.warn(`Socket defaultGuard "${this.defaultGuard}" not found in socket kernel`)
        }
      }
    }
  }

  use(name: keyof SocketMiddleware): this {
    if (this.middleware) {
      const fn: SocketMiddleware | undefined = this.middleware[name]
      if (!fn) {
        throw new Error(`Socket middleware "${name}" not found`)
      }
      if (this.namespace) {
        this.namespace.use(fn)
      }
    }
    return this
  }

  on(event: string, listener: (socket: Socket, ...args: any[]) => void): this {
    if (this.namespace) {
      this.namespace.on(event, listener)
    }
    return this
  }
}
