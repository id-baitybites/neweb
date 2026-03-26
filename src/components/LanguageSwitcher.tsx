'use client'

import { setLocale } from '@/actions/locale'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleLocaleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as 'en' | 'id'
    setIsPending(true)
    await setLocale(nextLocale)
    router.refresh()
    setIsPending(false)
  }

  return (
    <select
      value={currentLocale}
      onChange={handleLocaleChange}
      disabled={isPending}
      style={{
        padding: '0.4rem 0.8rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        outline: 'none',
        opacity: isPending ? 0.5 : 1
      }}
    >
      <option value="id" style={{ color: '#000' }}>Indonesia</option>
      <option value="en" style={{ color: '#000' }}>English</option>
    </select>
  )
}
