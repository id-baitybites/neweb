import { NextRequest, NextResponse } from 'next/server'
import { trackShipment, getEffectiveApiKey } from '@/lib/biteship'
import { resolveTenant } from '@/lib/tenant'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ trackingId: string }> }
) {
    try {
        const tenant = await resolveTenant()
        const apiKey = getEffectiveApiKey(tenant?.config?.biteship)

        const { trackingId } = await params
        const { searchParams } = new URL(req.url)
        const courierCode = searchParams.get('courier') || 'jne'

        if (!trackingId) {
            return NextResponse.json({ error: 'trackingId is required' }, { status: 400 })
        }

        const result = await trackShipment(trackingId, courierCode, apiKey)
        return NextResponse.json(result)
    } catch (err: any) {
        console.error('[/api/shipping/track] Error:', err)
        return NextResponse.json({ error: err.message || 'Tracking failed' }, { status: 500 })
    }
}
