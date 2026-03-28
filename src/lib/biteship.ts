/**
 * Biteship API Service
 * Docs: https://biteship.com/id/docs
 * All calls are server-side only — API key never exposed to the browser.
 * Each tenant supplies their own API key stored in tenant.config.biteship.apiKey.
 */

const BITESHIP_BASE = 'https://api.biteship.com/v1'
// Platform-level fallback key (optional) — tenants should configure their own
const PLATFORM_BITESHIP_KEY = process.env.BITESHIP_API_KEY || ''

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BiteshipCoordinate {
    latitude: number
    longitude: number
}

export interface BiteshipAddress {
    name: string
    phone: string
    address: string
    note?: string
    postal_code?: string
    coordinate?: BiteshipCoordinate
}

export interface BiteshipRateItem {
    name: string
    description?: string
    value: number
    weight: number          // grams
    quantity: number
    length?: number
    width?: number
    height?: number
}

export interface GetRatesParams {
    origin_postal_code?: string
    origin_latitude?: number
    origin_longitude?: number
    destination_postal_code?: string
    destination_latitude?: number
    destination_longitude?: number
    couriers: string          // comma-separated e.g. "jne,jnt,sicepat"
    items: BiteshipRateItem[]
}

export interface BiteshipRate {
    courier_code: string
    courier_name: string
    courier_service_code: string
    courier_service_name: string
    tier_name: string
    description: string
    duration: string
    shipment_duration_range: string
    shipment_duration_unit: string
    service_type: string
    shipping_type: string
    price: number
    type: number
}

export interface BiteshipRatesResponse {
    success: boolean
    object: string
    message?: string
    origin: Record<string, any>
    destination: Record<string, any>
    pricing: BiteshipRate[]
}

export interface CreateOrderParams {
    origin_contact_name: string
    origin_contact_phone: string
    origin_address: string
    origin_postal_code?: string
    origin_coordinate?: BiteshipCoordinate
    origin_note?: string

    destination_contact_name: string
    destination_contact_phone: string
    destination_address: string
    destination_postal_code?: string
    destination_coordinate?: BiteshipCoordinate
    destination_note?: string

    courier_company: string
    courier_type: string
    courier_insurance?: number

    delivery_type: 'now' | 'scheduled'
    pickup_time?: string       // ISO8601 for scheduled

    items: BiteshipRateItem[]
    metadata?: Record<string, any>
}

export interface BiteshipOrder {
    id: string
    status: string
    tracking_id: string
    waybill_id?: string
    courier: {
        company: string
        name: string
        phone?: string
        driver_name?: string
        driver_phone?: string
        link?: string
    }
    price: number
    origin: Record<string, any>
    destination: Record<string, any>
    items: any[]
    metadata?: Record<string, any>
    note?: string
    created_at: string
}

export interface BiteshipTrackingEvent {
    note: string
    status: string
    updated_at: string
    location?: string
}

export interface BiteshipTrackingResponse {
    success: boolean
    message?: string
    active_tracking: {
        status: string
        note: string
        updated_at: string
    }
    origin: Record<string, any>
    destination: Record<string, any>
    courier: Record<string, any>
    trackings?: BiteshipTrackingEvent[]
}

// ─── HTTP Helper ──────────────────────────────────────────────────────────────

/**
 * Returns the effective Biteship API key.
 * Priority: tenant-configured key → platform .env fallback.
 */
export function getEffectiveApiKey(tenantBiteshipConfig?: { apiKey?: string }): string {
    const key = tenantBiteshipConfig?.apiKey || PLATFORM_BITESHIP_KEY
    if (!key) throw new Error('Biteship API key is not configured. Set it in Admin → Settings → Shipping.')
    return key
}

async function biteshipFetch<T>(
    path: string,
    apiKey: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${BITESHIP_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...options.headers,
        },
        cache: 'no-store',
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || `Biteship API error: ${res.status}`)
    return data as T
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getShippingRates(params: GetRatesParams, apiKey: string): Promise<BiteshipRatesResponse> {
    return biteshipFetch<BiteshipRatesResponse>('/rates/couriers', apiKey, {
        method: 'POST',
        body: JSON.stringify(params),
    })
}

export async function createShipmentOrder(params: CreateOrderParams, apiKey: string): Promise<BiteshipOrder> {
    return biteshipFetch<BiteshipOrder>('/orders', apiKey, {
        method: 'POST',
        body: JSON.stringify(params),
    })
}

export async function trackShipment(waybillId: string, courierCode: string, apiKey: string): Promise<BiteshipTrackingResponse> {
    return biteshipFetch<BiteshipTrackingResponse>(
        `/trackings/${encodeURIComponent(waybillId)}/couriers/${encodeURIComponent(courierCode)}`,
        apiKey
    )
}

export async function getShipmentOrder(biteshipOrderId: string, apiKey: string): Promise<BiteshipOrder> {
    return biteshipFetch<BiteshipOrder>(`/orders/${encodeURIComponent(biteshipOrderId)}`, apiKey)
}

export async function cancelShipmentOrder(biteshipOrderId: string, apiKey: string): Promise<{ success: boolean }> {
    return biteshipFetch<{ success: boolean }>(`/orders/${encodeURIComponent(biteshipOrderId)}`, apiKey, {
        method: 'DELETE',
    })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format IDR price */
export function formatShippingPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

/** Map Biteship order status to our internal ShipmentStatus enum */
export function mapBiteshipStatus(status: string): string {
    const map: Record<string, string> = {
        'confirmed': 'CONFIRMED',
        'allocating': 'ALLOCATING',
        'allocated': 'ALLOCATING',
        'picking_up': 'PICKING_UP',
        'picked': 'PICKED',
        'dropping_off': 'DROPPING_OFF',
        'delivered': 'DELIVERED',
        'return_in_progress': 'RETURN_IN_PROGRESS',
        'returned': 'RETURNED',
        'cancelled': 'CANCELLED',
        'disposed': 'DISPOSED',
        'on_hold': 'ON_HOLD',
    }
    return map[status?.toLowerCase()] || 'PENDING'
}

/** Popular Indonesian couriers for the rate checker form */
export const COURIER_OPTIONS = [
    { value: 'jne', label: 'JNE' },
    { value: 'jnt', label: 'J&T Express' },
    { value: 'sicepat', label: 'SiCepat' },
    { value: 'anteraja', label: 'AnterAja' },
    { value: 'pos', label: 'Pos Indonesia' },
    { value: 'tiki', label: 'TIKI' },
    { value: 'lion', label: 'Lion Parcel' },
    { value: 'ninja', label: 'Ninja Xpress' },
    { value: 'gosend', label: 'GoSend' },
    { value: 'grab', label: 'GrabExpress' },
]
