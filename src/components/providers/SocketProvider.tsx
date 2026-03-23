'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io as ClientIO } from 'socket.io-client'

type SocketContextType = {
    socket: any | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<any | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Skip socket connection in production (Netlify doesn't support raw WebSockets in serverless functions)
        if (process.env.NODE_ENV === 'production') {
            console.warn('Socket.io disabled in production (Netlify Environment)')
            return
        }

        const socketInstance = ClientIO({
            path: '/api/socket',
            addTrailingSlash: false,
        })

        socketInstance.on('connect', () => {
            console.log('Socket.io connected (client)')
            setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
            console.log('Socket.io disconnected (client)')
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
