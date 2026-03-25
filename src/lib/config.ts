// ── Platform-level configuration (not tenant-specific) ────────────────────────

export const PLATFORM_CONFIG = {
    name: 'StoreOS',
    version: '1.0.0',
    supportEmail: 'support@storeos.app',
    plans: {
        FREE: { maxProducts: 10, maxOrders: 50, price: 0 },
        STARTER: { maxProducts: 100, maxOrders: 500, price: 99000 },
        PRO: { maxProducts: 500, maxOrders: 5000, price: 299000 },
        ENTERPRISE: { maxProducts: -1, maxOrders: -1, price: -1 },
    },
}

// ── Formatter helpers (locale-aware) ──────────────────────────────────────────

const CURRENCY_MAP: Record<string, string> = {
    'Rp': 'IDR', 'rp': 'IDR', 'IDR': 'IDR',
    '$': 'USD', 'USD': 'USD',
    '€': 'EUR', 'EUR': 'EUR',
    '£': 'GBP', 'GBP': 'GBP',
    '¥': 'JPY', 'JPY': 'JPY',
}

export const getSafeCurrency = (code: string | undefined): string => {
    if (!code) return 'IDR'
    const mapped = CURRENCY_MAP[code]
    if (mapped) return mapped
    return code.length === 3 ? code.toUpperCase() : 'IDR'
}

export const formatPrice = (price: number, currencyRaw = 'IDR', locale = 'id-ID') => {
    const currency = getSafeCurrency(currencyRaw)
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

export const formatDate = (date: Date | string, locale = 'id-ID') => {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
