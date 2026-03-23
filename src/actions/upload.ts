'use server';

import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { getCurrentUser } from '@/actions/auth';

export async function uploadImageAction(formData: FormData, folder: string = 'bitespace') {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { success: false, error: 'No file provided' };
    }

    const user = await getCurrentUser();
    if (!user || user.role === 'CUSTOMER') {
        throw new Error('Unauthorized');
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageUrl = await uploadImageToCloudinary(buffer, folder);
        return { success: true, url: imageUrl };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return { success: false, error: 'Failed to upload image' };
    }
}
