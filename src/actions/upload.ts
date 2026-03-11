'use server';

import { uploadBase64ToCloudinary } from '@/lib/cloudinary';
import { getCurrentUser } from '@/actions/auth';

export async function uploadImageAction(base64Image: string, folder: string = 'baitybites') {
    const user = await getCurrentUser();
    if (!user || user.role === 'CUSTOMER') {
        throw new Error('Unauthorized');
    }

    try {
        const imageUrl = await uploadBase64ToCloudinary(base64Image, folder);
        return { success: true, url: imageUrl };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return { success: false, error: 'Failed to upload image' };
    }
}
