import { NextRequest, NextResponse } from 'next/server'
import { createShipmentOrder, mapBiteshipStatus, CreateOrderParams, getEffectiveApiKey } from '@/lib/biteship'
import { prisma } from '@/lib/prisma' // Re-checking Prisma client definition
import { getCurrentUser } from '@/actions/auth'
import { resolveTenant } from '@/lib/tenant'

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || !['OWNER', 'STAFF', 'SUPER_ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tenant = await resolveTenant()
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        const body = await req.json()
        const {
            senderName, senderPhone, senderAddress, senderPostal,
            receiverName, receiverPhone, receiverAddress, receiverPostal,
            weightGrams, itemDescription, itemValue,
            courierCode, serviceType, courierName, serviceLabel,
            orderId, price, estimatedDay,
        } = body

        // Validate required fields
        const required = { senderName, senderPhone, senderAddress, receiverName, receiverPhone, receiverAddress, weightGrams, courierCode, serviceType }
        const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k)
        if (missing.length > 0) {
            return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 })
        }

        const orderParams: CreateOrderParams = {
            origin_contact_name: senderName,
            origin_contact_phone: senderPhone,
            origin_address: senderAddress,
            origin_postal_code: senderPostal,

            destination_contact_name: receiverName,
            destination_contact_phone: receiverPhone,
            destination_address: receiverAddress,
            destination_postal_code: receiverPostal,

            courier_company: courierCode,
            courier_type: serviceType,

            delivery_type: 'now',

            items: [{
                name: itemDescription || 'Package',
                description: itemDescription || '',
                value: itemValue || 0,
                weight: weightGrams,
                quantity: 1,
            }],

            metadata: { tenantId: tenant.id, orderId },
        }

        const apiKey = getEffectiveApiKey(tenant.config?.biteship)
        const biteshipOrder = await createShipmentOrder(orderParams, apiKey)

        // Persist to database
        const shipment = await (prisma as any).shipment.create({
            data: {
                tenantId: tenant.id,
                orderId: orderId || null,
                biteshipOrderId: biteshipOrder.id,
                trackingId: biteshipOrder.tracking_id,
                waybillId: biteshipOrder.waybill_id || null,
                courierCode,
                courierName: courierName || biteshipOrder.courier?.company || courierCode,
                serviceType,
                serviceLabel: serviceLabel || serviceType,
                senderName, senderPhone, senderAddress, senderCity: null, senderPostal,
                receiverName, receiverPhone, receiverAddress, receiverCity: null, receiverPostal,
                weightGrams: Number(weightGrams),
                itemDescription: itemDescription || null,
                itemValue: itemValue ? Number(itemValue) : null,
                status: mapBiteshipStatus(biteshipOrder.status) as any,
                price: price ? Number(price) : null,
                estimatedDay: estimatedDay ? Number(estimatedDay) : null,
            },
        })

        return NextResponse.json({ success: true, shipment, biteshipOrder })
    } catch (err: any) {
        console.error('[/api/shipping/orders POST] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to create shipment' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || !['OWNER', 'STAFF', 'SUPER_ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tenant = await resolveTenant()
        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

        const shipments = await (prisma as any).shipment.findMany({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ shipments })
    } catch (err: any) {
        console.error('[/api/shipping/orders GET] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to load shipments' }, { status: 500 })
    }
}
