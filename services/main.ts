import app from '@adonisjs/core/services/app'
import { SocketManager } from '../src/socket_manager.js'

let socket: SocketManager
await app.booted(async () => {
  socket = await app.container.make('socket')
})

export { socket as default }
