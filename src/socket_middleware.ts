import type { Socket } from 'socket.io'

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => Promise<void> | void
