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

    if (!tenant) throw new Error("No active store found")
    
    // Check authorization
    const isAuthorized = user?.role === 'SUPER_ADMIN' || 
                       ((user?.role === 'OWNER' || user?.role === 'STAFF') && user.tenantId === tenant.id)

    if (!isAuthorized) {
        throw new Error("Unauthorized access")
    }

    try {
        const customers = await prisma.user.findMany({
            where: { 
                tenantId: tenant.id,
                role: 'CUSTOMER'
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
