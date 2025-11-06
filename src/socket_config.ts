import type { ServerOptions } from 'socket.io'
import type { SocketMiddleware } from './socket_middleware.js'

/**
 * Define the shape of the config
 */
export type SocketConfig = {
  /**
   * The default guard to apply to all channels.
   * Must be a key from `start/socket_kernel.ts`.
   * Set to `null` to disable.
   */
  defaultGuard: keyof SocketMiddleware | null

  /**
   * Native options passed directly to the `new Server(options)`
   * constructor from socket.io.
   */
  socketIoOptions: Partial<ServerOptions>

  socketKernelPath: string
}

export default SocketConfig
