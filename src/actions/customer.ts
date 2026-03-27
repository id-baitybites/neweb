'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { resolveTenant } from '@/lib/tenant'

/**
 * Fetch all customers for the current tenant (Admin only) with enhanced stats
 */
export const getAdminCustomers = async () => {
    const user = await getCurrentUser()
    const tenant = await resolveTenant()
    
    // Authorization check
    const isAuthorized = user?.role === 'SUPER_ADMIN' || 
                       (tenant && (user?.role === 'OWNER' || user?.role === 'STAFF') && user.tenantId === tenant.id)

    if (!isAuthorized) {
        throw new Error("Unauthorized access")
    }

    try {
        const customers = await prisma.user.findMany({
            where: { 
                role: 'CUSTOMER',
                ...(tenant ? { tenantId: tenant.id } : {})
            },
            include: {
                profile: true,
                orders: {
                    select: {
                        id: true,
                        total: true,
                        status: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Calculate stats
        const total = customers.length
        const active = customers.filter(c => (c as any).isActive).length
        const inactive = total - active
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const loggedInToday = customers.filter(c => (c as any).lastLogin && new Date((c as any).lastLogin) >= today).length

        return { 
            success: true, 
            customers,
            stats: {
                total,
                active,
                inactive,
                loggedInToday
            }
        }
    } catch (error: any) {
        console.error('Error fetching admin customers:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Fetch detailed information for a single customer (Admin only)
 */
export const getAdminCustomerDetails = async (id: string) => {
    const user = await getCurrentUser()
    const tenant = await resolveTenant()

    // Authorization check
    const isAuthorized = user?.role === 'SUPER_ADMIN' || 
                       (tenant && (user?.role === 'OWNER' || user?.role === 'STAFF') && user.tenantId === tenant.id)

    if (!isAuthorized) {
        throw new Error("Unauthorized access")
    }

    try {
        const customer = await (prisma.user.findFirst as any)({
            where: { 
                id,
                ...(tenant ? { tenantId: tenant.id } : {}),
                role: 'CUSTOMER'
            },
            include: {
                profile: true,
                orders: {
                    include: {
                        orderItems: {
                            include: { product: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!customer) return { success: false, error: "Pelanggan tidak ditemukan" }

        return { success: true, customer }
    } catch (error: any) {
        console.error('Error fetching customer details:', error)
        return { success: false, error: error.message }
    }
}
