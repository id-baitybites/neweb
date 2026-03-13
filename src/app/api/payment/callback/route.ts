import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { snap } from '@/lib/midtrans'
import crypto from 'crypto'
import { sendOrderEmail } from '@/lib/mail'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // 1. Verify Midtrans Notification (Signature Key Verify)
        const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
        const notificationString = body.order_id + body.status_code + body.gross_amount + serverKey
        const signature = crypto.createHash('sha512').update(notificationString).digest('hex')

        if (signature !== body.signature_key) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const orderId = body.order_id
        const transactionStatus = body.transaction_status
        const fraudStatus = body.fraud_status

        console.log(`Payment notification received: Order ${orderId}, Status: ${transactionStatus}`)

        // 2. Update Order Status in DB
        let paymentStatus = 'UNPAID'
        let orderStatus = 'PENDING'

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'accept') {
                paymentStatus = 'PAID'
                orderStatus = 'PROCESSING'
            }
        } else if (transactionStatus == 'settlement') {
            paymentStatus = 'PAID'
            orderStatus = 'PROCESSING'
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            paymentStatus = 'FAILED'
            orderStatus = 'CANCELLED'
        } else if (transactionStatus == 'pending') {
            paymentStatus = 'PENDING'
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus,
                status: orderStatus as any
            },
            include: {
                tenant: true
            }
        })

        // 3. Send Notification Email if Payment logic is completed/paid
        if (paymentStatus === 'PAID') {
            // @ts-ignore - types may be outdated until next prisma generate
            const email = updatedOrder.customerEmail || updatedOrder.user?.email;
            if (email) {
                // @ts-ignore
                sendOrderEmail(email, updatedOrder.id, updatedOrder.total, updatedOrder.tenant as any, 'CONFIRMED').catch(e => {
                    console.error('[Callback Notification] Failed to send payment confirmation email:', e);
                });
            }
        }

        return NextResponse.json({ message: 'OK' })
    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
