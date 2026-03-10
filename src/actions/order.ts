'use server'

import { prisma } from '@/lib/prisma'
import { snap } from '@/lib/midtrans'
import { getCurrentUser } from '@/actions/auth'


import { resolveTenant } from '@/lib/tenant'

export const createOrder = async (orderData: any, cartItems: any[]) => {
    const user = await getCurrentUser()
    const tenant = await resolveTenant()

    if (!tenant) throw new Error("No active store found")

    try {
        // 1. Calculate total
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        const deliveryFee = orderData.method === 'DELIVERY' ? tenant.config.deliveryFee : 0
        const total = subtotal + deliveryFee

        // 2. Create Order in DB
        const order = await prisma.order.create({
            data: {
                tenantId: tenant.id,
                userId: user?.id || null,
                total,
                method: orderData.method,
                status: 'PENDING',
                orderItems: {
                    create: cartItems.map(item => ({

                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        custom: item.customization || {}
                    }))
                },
                delivery: orderData.method === 'DELIVERY' ? {
                    create: {
                        address: orderData.address,
                        method: 'GoSend/GrabExpress Placeholder',
                        status: 'PENDING'
                    }
                } : undefined
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

        // 3. Create Midtrans Transaction
        const parameter = {
            transaction_details: {
                order_id: order.id,
                gross_amount: total,
            },
            item_details: [
                ...cartItems.map(item => ({
                    id: item.productId,
                    price: item.price,
                    quantity: item.quantity,
                    name: item.name
                })),
                {
                    id: 'DELIVERY_FEE',
                    price: deliveryFee,
                    quantity: 1,
                    name: 'Biaya Pengiriman'
                }
            ],
            customer_details: {
                first_name: orderData.name,
                email: orderData.email || user?.email,
                phone: orderData.phone,
                shipping_address: {
                    first_name: orderData.name,
                    phone: orderData.phone,
                    address: orderData.address,
                }
            },
            // Callbacks for Snap
            enabled_payments: ["credit_card", "cimb_clicks", "mandiri_clickpay", "kb_bukopin_click", "bca_klikbca", "bca_klikpay", "bri_epay", "echannel", "permata_va", "bca_va", "bni_va", "bri_va", "cimb_va", "other_va", "gopay", "indomaret", "alfamart", "shopeepay", "kredivo", "akulaku"],
        }

        const transaction = await snap.createTransaction(parameter)

        // Update order with payment token
        await prisma.order.update({
            where: { id: order.id },
            data: { paymentToken: transaction.token }
        })

        return {
            success: true,
            token: transaction.token,
            orderId: order.id
        }

    } catch (error: any) {
        console.error('Checkout error:', error)
        return { success: false, error: error.message }
    }
}
