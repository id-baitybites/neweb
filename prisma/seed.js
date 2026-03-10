const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Clean up
    await prisma.orderItem.deleteMany()
    await prisma.delivery.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.user.deleteMany()
    await prisma.tenant.deleteMany()

    // 1. Create Super Admin (No tenant)
    const superAdminPassword = await bcrypt.hash('superadmin123', 10)
    await prisma.user.create({
        data: {
            email: 'admin@storeos.app',
            password: superAdminPassword,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
        }
    })

    // 2. Create Tenant A (Baitybites)
    const tenantA = await prisma.tenant.create({
        data: {
            slug: 'baitybites',
            name: 'Baitybites Jakarta',
            theme: {
                primary: '#FF69B4',
                secondary: '#8B4513',
                accent: '#FFB6C1',
                background: '#FFF5F7',
                font: 'Inter'
            },
            config: {
                currency: 'IDR',
                timezone: 'Asia/Jakarta',
                language: 'id',
                deliveryFee: 25000,
                minPreOrderDays: 1
            }
        }
    })

    // 3. Create Tenant B (SweetCakes)
    const tenantB = await prisma.tenant.create({
        data: {
            slug: 'sweetcakes',
            name: 'Sweet Cakes Bandung',
            theme: {
                primary: '#8B5CF6',
                secondary: '#4C1D95',
                accent: '#DDD6FE',
                background: '#F5F3FF',
                font: 'Inter'
            },
            config: {
                currency: 'IDR',
                timezone: 'Asia/Jakarta',
                language: 'id',
                deliveryFee: 15000,
                minPreOrderDays: 2
            }
        }
    })

    // 4. Create Users for Tenant A
    const password = await bcrypt.hash('password123', 10)
    await prisma.user.createMany({
        data: [
            {
                tenantId: tenantA.id,
                email: 'owner@baitybites.com',
                password,
                name: 'Owner Baitybites',
                role: 'OWNER'
            },
            {
                tenantId: tenantA.id,
                email: 'staff@baitybites.com',
                password,
                name: 'Staff Baitybites',
                role: 'STAFF'
            }
        ]
    })

    // 5. Create Users for Tenant B
    await prisma.user.createMany({
        data: [
            {
                tenantId: tenantB.id,
                email: 'owner@sweetcakes.com',
                password,
                name: 'Owner SweetCakes',
                role: 'OWNER'
            }
        ]
    })

    // 6. Create Products for Tenant A
    await prisma.product.create({
        data: {
            tenantId: tenantA.id,
            name: 'Signature Chocolate Cake',
            price: 350000,
            description: 'Kue coklat premium.',
            stock: 10
        }
    })

    // 7. Create Products for Tenant B
    await prisma.product.create({
        data: {
            tenantId: tenantB.id,
            name: 'Purple Velvet Cake',
            price: 275000,
            description: 'Kue taro dengan cream cheese.',
            stock: 15
        }
    })

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
