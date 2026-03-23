'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth';
import { revalidatePath } from 'next/cache';

export async function createProductAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'STAFF') || !user.tenantId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const description = formData.get('description') as string;
        const stock = parseInt(formData.get('stock') as string || '0');
        const imageUrl = formData.get('imageUrl') as string || null;
        const category = formData.get('category') as string || 'Cake';

        const product = await prisma.product.create({
            data: {
                tenantId: user.tenantId,
                name,
                price,
                description,
                stock,
                imageUrl,
                category,
                isActive: true
            }
        });

        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true, product };
    } catch (error: any) {
        console.error('Failed to create product:', error);
        return { success: false, error: error.message };
    }
}

export async function updateProductAction(id: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'STAFF') || !user.tenantId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const description = formData.get('description') as string;
        const stock = parseInt(formData.get('stock') as string || '0');
        const imageUrl = formData.get('imageUrl') as string || undefined;
        const category = formData.get('category') as string || undefined;
        const isActive = formData.get('isActive') === 'true';

        await prisma.product.update({
            where: { id, tenantId: user.tenantId },
            data: {
                name,
                price,
                description,
                stock,
                imageUrl,
                category,
                isActive
            }
        });

        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update product:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteProductAction(id: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'OWNER' || !user.tenantId) {
        return { success: false, error: 'Unauthorized: Only owners can delete products.' };
    }

    try {
        // Soft delete (isActive: false) is often safer for orders history, 
        // but here the USER wants CRUD. Let's check for order items first.
        const linkedItems = await prisma.orderItem.count({ where: { productId: id } });
        if (linkedItems > 0) {
            // Cannot delete used products, just deactivate them
            await prisma.product.update({
                where: { id, tenantId: user.tenantId },
                data: { isActive: false }
            });
            return { success: true, message: 'Product is linked to orders, deactivating instead of deleting.' };
        }

        await prisma.product.delete({
            where: { id, tenantId: user.tenantId }
        });

        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete product:', error);
        return { success: false, error: error.message };
    }
}
