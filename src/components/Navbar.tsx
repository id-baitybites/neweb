'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, User as UserIcon, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { logout } from '@/actions/auth'
import { toast } from 'sonner'
import { TenantData } from '@/lib/tenant'
import LanguageSwitcher from './LanguageSwitcher'
import styles from '@/styles/modules/Navbar.module.scss'

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

const NAV_DICT = {
    en: {
        home: 'Home',
        products: 'Products',
        about: 'About',
        login: 'Login',
        logout_success: 'Logged out successfully',
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

    const t = useMemo(() => NAV_DICT[locale] || NAV_DICT.en, [locale])
    const tenantPrefix = tenant ? `/${tenant.slug}` : ''

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await logout()
        toast.success(t.logout_success)
        router.push(tenant ? tenantPrefix : '/')
        router.refresh()
        // Wait briefly for router to settle before a hard reload if necessary, 
        // but refresh() should handle it for RSC.
        setTimeout(() => window.location.reload(), 500)
    }

    const isActive = (path: string) => pathname === path || (path !== '/' && pathname?.startsWith(path))

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.container}`}>
                {/* Brand Logo */}
                <Link href={tenant ? tenantPrefix : '/'} className={styles.logo}>
                    {tenant?.logoUrl ? (
                        <img
                            src={tenant.logoUrl}
                            alt={tenant.name || 'Store'}
                            className={`${styles.logoImg} ${isScrolled ? styles.shrunk : ''}`}
                            style={{ objectFit: 'contain' }}
                        />
                    ) : (
                        <span>{tenant?.name || 'Bitespace'}</span>
                    )}
                </Link>

                {/* Navigation Links */}
                <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                    {tenant ? (
                        <>
                            <Link href={tenantPrefix} className={pathname === tenantPrefix ? styles.active : ''}>{t.home}</Link>
                            <Link href={`${tenantPrefix}/products`} className={isActive(`${tenantPrefix}/products`) ? styles.active : ''}>{t.products}</Link>
                            <Link href={`${tenantPrefix}/about`} className={isActive(`${tenantPrefix}/about`) ? styles.active : ''}>{t.about}</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className={pathname === '/' ? styles.active : ''}>{t.platform}</Link>
                            <Link href="/#features">{t.features}</Link>
                            <Link href="/pricing" className={isActive('/pricing') ? styles.active : ''}>{t.pricing}</Link>
                            <Link href="/#merchants">{t.merchants}</Link>
                            <Link href="/about" className={isActive('/about') ? styles.active : ''}>{t.about_us}</Link>
                        </>
                    )}
                </div>

                {/* Action Controls */}
                <div className={styles.actions}>
                    {tenant && (
                        <Link href={`${tenantPrefix}/cart`} className={styles.cartBtn} title="Keranjang">
                            <ShoppingCart size={24} />
                            {mounted && totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
                        </Link>
                    )}

                    {user ? (
                        <div className={styles.userMenu}>
                            {['OWNER', 'STAFF', 'SUPER_ADMIN'].includes(user.role) ? (
                                <Link href={user.role === 'SUPER_ADMIN' ? '/super-admin' : `${tenantPrefix}/admin`} title="Dashboard">
                                    <LayoutDashboard size={24} />
                                </Link>
                            ) : (
                                <Link href={`${tenantPrefix}/profile`} title="Profile">
                                    <UserIcon size={24} />
                                </Link>
                            )}
                            <button onClick={handleLogout} title="Logout">
                                <LogOut size={24} />
                            </button>
                        </div>
                    ) : (
                        <Link href={tenant ? `${tenantPrefix}/login` : "/login"} className="btn-primary">{t.login}</Link>
                    )}

                    <LanguageSwitcher currentLocale={locale} />

                    <button className={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    )
}
