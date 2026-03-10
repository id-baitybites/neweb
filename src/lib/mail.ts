import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendOrderEmail = async (to: string, orderId: string, total: number) => {
    const mailOptions = {
        from: '"Baitybites" <no-reply@baitybites.com>',
        to,
        subject: `Pesanan Baru Baitybites #${orderId}`,
        html: `
      <div style="font-family: sans-serif; color: #4E342E;">
        <h1 style="color: #FF69B4;">Terima Kasih atas Pesanan Anda!</h1>
        <p>Pesanan Anda <strong>#${orderId}</strong> telah kami terima.</p>
        <p>Total Pembayaran: <strong>Rp ${total.toLocaleString('id-ID')}</strong></p>
        <p>Kami akan segera memproses pesanan Anda setelah pembayaran dikonfirmasi.</p>
        <hr />
        <p style="font-size: 0.8rem; color: #888;">© 2024 Baitybites Jakarta</p>
      </div>
    `,
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`Email sent to ${to} for order ${orderId}`)
    } catch (error) {
        console.error('Email sending failed:', error)
    }
}

export const sendWAOrderNotification = async (phone: string, orderId: string) => {
    // Placeholder for WhatsApp Business API
    console.log(`[WA Notification Placeholder] Sending to ${phone}: Order #${orderId} is confirmed!`)
}
