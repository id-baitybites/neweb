'use client'

import React, { useEffect, useState } from 'react'
import styles from '@/styles/modules/Landing.module.scss'

interface HeroParallaxProps {
    children: React.ReactNode
    bgUrl?: string | null
    className?: string
}

export default function HeroParallax({ children, bgUrl, className }: HeroParallaxProps) {
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            // Move background slower than foreground (0.3 factor)
            setOffset(window.scrollY * 0.3)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const style = bgUrl ? {
        '--parallax-offset': `${offset}px`,
        '--hero-bg': `url(${bgUrl})`
    } as React.CSSProperties : undefined

    return (
        <section 
            className={`${styles.hero} ${bgUrl ? styles.hasCustomBg : ''} ${className || ''}`}
            style={style}
        >
            <div className={styles.parallaxBg} />
            {children}
        </section>
    )
}
