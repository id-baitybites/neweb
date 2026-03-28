# Panduan Pengaturan QRIS Multi-Tenant

Dokumen ini menjelaskan langkah-langkah bagi Merchant/Tenant untuk melakukan konfigurasi pembayaran melalui QRIS di platform Bitespace.

## 1. Persiapan Gambar Kode QRIS
Pastikan Anda memiliki gambar QRIS statis atau dinamis yang diperoleh dari provider (seperti GoBiz, ShopeePay, atau Bank).
- Format yang disarankan: `.png` atau `.jpg`.
- Pastikan resolusi cukup jelas untuk dipindai oleh pelanggan.

## 2. Parameter Konfigurasi

### National Merchant ID (NMID)
NMID adalah nomor identitas unik pedagang secara nasional.
- **Cara mendapatkan**: Biasanya tertera di bawah kode QRIS atau di dashboard provider Anda.
- **Format**: Biasanya berupa deretan angka yang diawali dengan `ID10...` atau serupa.

### Merchant ID
ID yang diberikan oleh provider spesifik (contoh: Midtrans, Xendit). Digunakan untuk identifikasi transaksi di sistem provider tersebut.

### QRIS Provider
Pilih provider yang Anda gunakan dari menu dropdown. Jika provider Anda tidak terdaftar, pilih "Other / Manual QRIS".

### Fee Type & Value
Pengaturan biaya tambahan (MDR atau biaya admin):
- **Percentage (%)**: Misal `0.7` untuk MDR standar QRIS.
- **Flat**: Misal `500` jika Anda mengenakan biaya admin tetap per transaksi.

## 3. Callback URL (Webhook)
Digunakan agar sistem Bitespace dapat menerima notifikasi otomatis ketika pelanggan telah menerima pembayaran.
- **Format**: `https://dashboard.bitespace.id/api/qris/callback/[tenant-slug]`
- **Penting**: Pastikan URL ini dimasukkan ke dalam dashboard provider Anda (Xendit/Midtrans) di bagian Settings > Webhooks/Callbacks.

## 4. Langkah Pengaturan di Dashboard
1. Masuk ke **Pengaturan Toko** > **Payment & QRIS**.
2. Unggah gambar QRIS Anda pada bagian "Upload QRIS Image".
3. Isi data **Merchant Name**, **NMID**, dan **Merchant ID**.
4. Pilih **Provider** yang sesuai.
5. Klik **Simpan Pengaturan**.

---
*Catatan: Pastikan data yang Anda masukkan akurat untuk mencegah kegagalan verifikasi transaksi pelanggan.*
