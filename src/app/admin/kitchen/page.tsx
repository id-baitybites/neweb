import React from 'react'
import KitchenClient from '@/components/admin/KitchenClient'
import { getDictionary } from '@/i18n'

export default async function KitchenPage() {
    const dict = await getDictionary()

    return <KitchenClient dict={dict} />
}
