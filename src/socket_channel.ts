import { Namespace, Socket } from 'socket.io'

/**
 * Helper class that wraps the Namespace
 */
export class SocketChannel {
  private namespace: Namespace | null = null
  constructor(public channelName: string) {}

  setNamespace(namespace: Namespace): this {
    this.namespace = namespace
    return this
  }
  isRegistered(): boolean {
    return this.namespace !== null
  }
  use(fn: (socket: Socket, next: (err?: Error) => void) => Promise<void>) {
    if (this.namespace) {
      this.namespace.use(fn)
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
