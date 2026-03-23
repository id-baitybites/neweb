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
        padding: '0.4rem',
        borderRadius: '8px',
        border: '1px solid currentColor',
        background: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: '0.85rem',
        outline: 'none',
        opacity: isPending ? 0.5 : 1
      }}
    >
      <option value="id" style={{ color: '#000' }}>🇮🇩 ID</option>
      <option value="en" style={{ color: '#000' }}>🇬🇧 EN</option>
    </select>
  )
}
