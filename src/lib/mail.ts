import nodemailer from 'nodemailer';
import { TenantData } from './tenant';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a branded order confirmation email to the customer.
 */
export const sendOrderEmail = async (
    to: string, 
    orderId: string, 
    total: number, 
    tenant: TenantData,
    type: 'RECEIVED' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED' = 'RECEIVED'
) => {
    const brandColor = tenant.theme.primary || '#FF69B4'; // Fallback to Pink
    const storeName = tenant.name;
    const storeLogo = tenant.logoUrl;
    
    const statusMessages = {
        RECEIVED: {
            title: 'Pesanan Diterima',
            subtitle: 'Kami telah menerima pesanan Anda dan menunggu konfirmasi pembayaran.',
            color: brandColor
        },
        CONFIRMED: {
            title: 'Pembayaran Berhasil!',
            subtitle: 'Pesanan Anda sedang diproses oleh tim kami.',
            color: '#10B981' // Green
        },
        SHIPPED: {
            title: 'Pesanan Dikirim',
            subtitle: 'Pesanan Anda sedang dalam perjalanan ke alamat tujuan.',
            color: '#3B82F6' // Blue
        },
        CANCELLED: {
            title: 'Pesanan Dibatalkan',
            subtitle: 'Mohon maaf, pesanan Anda telah dibatalkan.',
            color: '#EF4444' // Red
        }
    };

    const status = statusMessages[type];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(tenant.config.language === 'id' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: tenant.config.currency,
            minimumFractionDigits: 0,
        }).format(price);
    };

    const mailOptions = {
        from: `"${storeName}" <no-reply@storeos.app>`, // Dynamic sender name
        to,
        subject: `[${storeName}] ${status.title} #${orderId}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { padding: 40px; text-align: center; border-bottom: 1px solid #f3f4f6; }
                .logo { max-height: 50px; margin-bottom: 20px; }
                .content { padding: 40px; color: #374151; line-height: 1.6; }
                .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 20px; }
                .order-id { font-family: monospace; font-size: 1.1rem; color: #6b7280; }
                .footer { padding: 30px; text-align: center; font-size: 0.8rem; color: #9ca3af; background-color: #fdfdfd; }
                .btn { display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    ${storeLogo ? `<img src="${storeLogo}" class="logo" />` : `<h2 style="color: ${brandColor}; margin: 0;">${storeName}</h2>`}
                    <div class="status-badge" style="background-color: ${status.color}15; color: ${status.color};">
                        ${status.title}
                    </div>
                    <h1 style="font-size: 24px; margin: 0; color: #111827;">Order #${orderId}</h1>
                </div>
                <div class="content">
                    <p>${status.subtitle}</p>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 24px 0;">
                        <div style="font-weight: bold; color: #64748b; margin-bottom: 8px;">TOTAL PEMBAYARAN</div>
                        <div style="font-size: 28px; font-weight: 800; color: #0f172a;">${formatPrice(total)}</div>
                    </div>
                    <p>Terima kasih telah mempercayakan kebutuhan Anda kepada <strong>${storeName}</strong>.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.<br/>
                    Didukung oleh StoreOS
                </div>
            </div>
        </body>
        </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Sent ${type} notification to ${to} for Order ${orderId}`);
        return { success: true };
    } catch (error: any) {
        console.error('[Email Service] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

export const sendWAOrderNotification = async (phone: string, orderId: string, tenant: TenantData) => {
    // Placeholder for WhatsApp Business API
    console.log(`[WA Notification Service] Sending placeholder to ${phone} for ${tenant.name} Order #${orderId}`);
};
