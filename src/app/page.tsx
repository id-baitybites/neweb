import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import { getCurrentUser } from '@/actions/auth'
import Link from 'next/link'
import { ArrowRight, Search, ShieldCheck } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import Testimonies from '@/components/Testimonies'
import styles from '@/styles/modules/Landing.module.scss'
import homeStyles from '@/styles/modules/Home.module.scss'

export default async function Home() {
  const tenant = await resolveTenant()
  const user = await getCurrentUser()

  let products: any[] = []
  let testimonies: any[] = []

  if (tenant) {
    // Get top 4 products (favorite products)
    products = await prisma.product.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { stock: 'desc' }, // Dummy logic for "favorite"
      take: 4
    })

    // Get approved testimonies
    testimonies = await prisma.testimony.findMany({
      where: { tenantId: tenant.id, isPublished: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  }

  return (
    <div style={{ backgroundColor: '#F8F9FA' }}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.chip}>
            <ShieldCheck size={16} style={{ marginRight: '0.5rem' }} />
            {tenant ? `Kelezatan Premium dari ${tenant.name}` : 'StoreOS Multitenant Solution'}
          </div>

          <h1>
            {tenant ? `Kue Pilihan Terbaik, Diantar ke Pintu Anda.` : 'Building Intelligent Online Commerce.'}
          </h1>

          <p>
            {tenant
              ? `Nikmati berbagai pilihan kue dan hidangan manis berkualitas premium yang dibuat dengan bahan-bahan terbaik dari ${tenant.name}.`
              : `A flexible, powerful solution that simplifies store management for modern businesses.`}
          </p>

          <div className={styles.actions} style={{ justifyContent: 'center' }}>
            <Link href="/products" className={styles.btnSolid}>
              Pesan Sekarang <ArrowRight size={18} />
            </Link>
            {!user && (
              <Link href="/login" className={styles.btnOutline}>
                Mulai <Search size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FAVORITE PRODUCTS */}
      <section className={styles.section}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div className={styles.header}>
            <h2>Top Selections</h2>
            <p>Produk pilihan kami yang paling direkomendasikan untuk Anda.</p>
          </div>

          <div className={homeStyles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#A0AEC0' }}>
              <p style={{ marginBottom: '1rem' }}>Belum ada produk unggulan yang tersedia.</p>
              {!tenant && (
                <p style={{ fontSize: '0.9rem' }}>
                  Tidak ada tenant aktif. Silakan buat tenant pertama Anda di{' '}
                  <Link href="/super-admin" style={{ color: 'var(--color-primary)' }}>/super-admin</Link>.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIES */}
      <section className={`${styles.section} ${styles.alt}`}>
        <div className="container">
          <Testimonies
            tenantId={tenant?.id}
            userRole={user?.role}
            testimonies={testimonies}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <h3>{tenant?.name || 'StoreOS'}</h3>
            <p>
              {tenant
                ? `Selamat datang di ${tenant.name}, kami siap melayani pesanan Anda setiap saat.`
                : `Platform pengelolaan e-commerce terbaik dan fleksibel.`}
            </p>
          </div>

          <div className={styles.links}>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/#testimonies">Reviews</Link></li>
            </ul>
          </div>

          <div className={styles.links}>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>

          <div className={styles.links}>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Support</a></li>
              <li><a href="#">Guide</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          &copy; {new Date().getFullYear()} {tenant?.name || 'StoreOS'}. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
