import { InvalidArgumentsException } from '@adonisjs/core/exceptions'
import SocketConfig from './socket_config.js'

export function defineConfig<T extends SocketConfig>(config: T): T {
  if (!config) {
    throw new InvalidArgumentsException('Invalid config. Must be valid config object.')
  }
  return config
}
