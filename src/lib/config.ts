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

export const formatPrice = (price: number, currency = 'IDR', locale = 'id-ID') => {
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
