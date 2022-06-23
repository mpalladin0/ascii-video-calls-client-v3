import { io } from "socket.io-client"

export function useSocket(serverUrl: string) {
    const socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        rememberUpgrade: true
    })
    return socket
}