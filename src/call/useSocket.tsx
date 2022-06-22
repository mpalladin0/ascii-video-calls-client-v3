import { io } from "socket.io-client"

export function useSocket(serverUrl: string) {
    const socket = io(serverUrl)
    return socket
}