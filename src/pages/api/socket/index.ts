import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseServerIO } from '../../../types/socket'

export const config = {
    api: {
        bodyParser: false,
    },
}

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        console.log('New Socket.io server...')
        const httpServer: NetServer = res.socket.server as any
        const io = new ServerIO(httpServer, {
            path: '/api/socket',
            addTrailingSlash: false,
        })
        res.socket.server.io = io

        io.on('connection', (socket) => {
            console.log('Socket connected:', socket.id)

            socket.on('new-order', (order) => {
                console.log('Received new-order:', order.id)
                io.emit('order-update', order)
            })

            socket.on('update-status', (data) => {
                console.log('Status update:', data.orderId, data.status)
                io.emit('status-changed', data)
            })

            socket.on('disconnect', () => {
                console.log('Socket disconnected:', socket.id)
            })
        })
    }
    res.end()
}

export default socketHandler
