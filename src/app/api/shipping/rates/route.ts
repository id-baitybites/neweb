import { NextRequest, NextResponse } from 'next/server'
import { getShippingRates, getEffectiveApiKey, GetRatesParams } from '@/lib/biteship'
import { resolveTenant } from '@/lib/tenant'

export async function POST(req: NextRequest) {
    try {
        const tenant = await resolveTenant()
        const apiKey = getEffectiveApiKey(tenant?.config?.biteship)

        const body = await req.json()
        const {
            origin_postal_code, origin_latitude, origin_longitude,
            destination_postal_code, destination_latitude, destination_longitude,
            couriers, weight, value = 0,
        } = body

        if (!couriers) return NextResponse.json({ error: 'couriers is required' }, { status: 400 })
        if (!weight || weight <= 0) return NextResponse.json({ error: 'valid weight (grams) is required' }, { status: 400 })

        const params: GetRatesParams = {
            couriers,
            items: [{ name: 'Package', description: '', value, weight, quantity: 1 }],
        }
        if (origin_postal_code) params.origin_postal_code = origin_postal_code
        if (origin_latitude && origin_longitude) { params.origin_latitude = origin_latitude; params.origin_longitude = origin_longitude }
        if (destination_postal_code) params.destination_postal_code = destination_postal_code
        if (destination_latitude && destination_longitude) { params.destination_latitude = destination_latitude; params.destination_longitude = destination_longitude }

        const result = await getShippingRates(params, apiKey)
        return NextResponse.json(result)
    } catch (err: any) {
        console.error('[/api/shipping/rates] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to fetch rates' }, { status: 500 })
    }
}
