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
        logout_success: 'Logged out successfully'
    },
    id: {
        home: 'Beranda',
        products: 'Produk',
        about: 'Tentang',
        login: 'Masuk',
        logout_success: 'Berhasil keluar'
    }
}

export default function Navbar({ user, tenant, locale = 'id' }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const totalItems = useCartStore((state) => state.totalItems())
    
    const t = navDict[locale]

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
                {/* Logo / Brand */}
                <Link href="/" className={styles.logo}>
                    {logoUrl ? (
                        <img src={logoUrl} alt={storeName} height={36} />
                    ) : (
                        <span>{storeName}</span>
                    )}
                </Link>

                <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                    {tenant ? (
                        <>
                            <Link href="/" className={pathname === '/' ? styles.active : ''}>{t.home}</Link>
                            <Link href="/products" className={pathname?.startsWith('/products') ? styles.active : ''}>{t.products}</Link>
                            <Link href="/about" className={pathname === '/about' ? styles.active : ''}>{t.about}</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className={pathname === '/' ? styles.active : ''}>Platform</Link>
                            <Link href="/#features">Fitur</Link>
                            <Link href="/pricing" className={pathname === '/pricing' ? styles.active : ''}>Paket</Link>
                            <Link href="/#merchants">Merchant</Link>
                            <Link href="/about" className={pathname === '/about' ? styles.active : ''}>Tentang Kami</Link>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    {tenant && (
                        <Link href="/cart" className={styles.cartBtn} title="Keranjang">
                            <ShoppingCart size={24} />
                            {mounted && totalItems > 0 && (
                                <span className={styles.badge}>{totalItems}</span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <div className={styles.userMenu}>
                            {(user.role === 'OWNER' || user.role === 'STAFF' || user.role === 'SUPER_ADMIN') ? (
                                <Link href={user.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin'} title="Dashboard">
                                    <LayoutDashboard size={24} />
                                </Link>
                            ) : (
                                <Link href="/profile" title="Profile">
                                    <User size={24} />
                                </Link>
                            )}
                            <button
                                onClick={async () => {
                                    await logout()
                                    toast.success(t.logout_success)
                                    router.push('/')
                                    window.location.reload()
                                }}
                                title="Logout"
                            >
                                <LogOut size={24} />
                            </button>
                        </div>
                    ) : (
                        <Link href={tenant ? `/${tenant.slug}/login` : "/login"} className="btn-primary">{t.login}</Link>
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
