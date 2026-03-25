'use client'

import Link from 'next/link'
import styles from '@/styles/modules/Navbar.module.scss'
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { logout } from '@/actions/auth'
import { toast } from 'sonner'
import type { TenantData } from '@/lib/tenant'
import LanguageSwitcher from './LanguageSwitcher'

type Role = 'CUSTOMER' | 'STAFF' | 'OWNER' | 'SUPER_ADMIN'

interface UserInfo {
    id: string
    email: string
    role: Role
}

interface NavbarProps {
    user?: UserInfo | null
    tenant?: TenantData | null
    locale?: 'en' | 'id'
}

const navDict = {
    en: {
        home: 'Home',
        products: 'Products',
        about: 'About',
        login: 'Login',
        logout_success: 'Logged out successfully',
        // Platform nav
        platform: 'Platform',
        features: 'Features',
        pricing: 'Pricing',
        merchants: 'Merchants',
        about_us: 'About Us',
    },
    id: {
        home: 'Beranda',
        products: 'Produk',
        about: 'Tentang',
        login: 'Masuk',
        logout_success: 'Berhasil keluar',
        // Platform nav
        platform: 'Platform',
        features: 'Fitur',
        pricing: 'Paket',
        merchants: 'Merchant',
        about_us: 'Tentang Kami',
    }
}

export default function Navbar({ user, tenant, locale = 'id' }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const totalItems = useCartStore((state) => state.totalItems(tenant?.id))
    
    const t = navDict[locale]

    // Slug-aware prefix: all tenant links must be relative to /{slug}/...
    const p = tenant ? `/${tenant.slug}` : ''

    useEffect(() => {
        setMounted(true)

        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const storeName = tenant?.name ?? 'Store'
    const logoUrl = tenant?.logoUrl

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.container}`}>
                {/* Logo / Brand — goes to tenant home or platform root */}
                <Link href={tenant ? `${p}` : '/'} className={styles.logo}>
                    {logoUrl ? (
                        <img src={logoUrl} alt={storeName} height={36} />
                    ) : (
                        <span>{storeName}</span>
                    )}
                </Link>

                <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                    {tenant ? (
                        <>
                            <Link href={`${p}`} className={pathname === `${p}` || pathname === `${p}/` ? styles.active : ''}>{t.home}</Link>
                            <Link href={`${p}/products`} className={pathname?.startsWith(`${p}/products`) ? styles.active : ''}>{t.products}</Link>
                            <Link href={`${p}/about`} className={pathname === `${p}/about` ? styles.active : ''}>{t.about}</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className={pathname === '/' ? styles.active : ''}>{t.platform}</Link>
                            <Link href="/#features">{t.features}</Link>
                            <Link href="/pricing" className={pathname === '/pricing' ? styles.active : ''}>{t.pricing}</Link>
                            <Link href="/#merchants">{t.merchants}</Link>
                            <Link href="/about" className={pathname === '/about' ? styles.active : ''}>{t.about_us}</Link>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    {tenant && (
                        <Link href={`${p}/cart`} className={styles.cartBtn} title="Keranjang">
                            <ShoppingCart size={24} />
                            {mounted && totalItems > 0 && (
                                <span className={styles.badge}>{totalItems}</span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <div className={styles.userMenu}>
                            {(user.role === 'OWNER' || user.role === 'STAFF' || user.role === 'SUPER_ADMIN') ? (
                                <Link href={user.role === 'SUPER_ADMIN' ? '/super-admin' : `${p}/admin`} title="Dashboard">
                                    <LayoutDashboard size={24} />
                                </Link>
                            ) : (
                                <Link href={`${p}/profile`} title="Profile">
                                    <User size={24} />
                                </Link>
                            )}
                            <button
                                onClick={async () => {
                                    await logout()
                                    toast.success(t.logout_success)
                                    router.push(tenant ? `${p}` : '/')
                                    window.location.reload()
                                }}
                                title="Logout"
                            >
                                <LogOut size={24} />
                            </button>
                        </div>
                    ) : (
                        <Link href={tenant ? `${p}/login` : "/login"} className="btn-primary">{t.login}</Link>
                    )}

                    <LanguageSwitcher currentLocale={locale} />
                    
                    {/* Mobile hamburger */}
                    <button className={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    )
}
