import SocketConfig from './socket_config.js'

export * from './socket_manager.js'
export type { SocketConfig }
export * from './socket_middleware.js'
export * from './socket_channel.js'

export function defineConfig(config: Partial<SocketConfig>): SocketConfig {
  return {
    defaultGuard: null,
    socketKernelPath: '#start/socket',
    socketIoOptions: {},
    socketRouterPath: '#start/channels',
    ...config,
  }
}
