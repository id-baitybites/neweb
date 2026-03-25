import { getDictionary } from '@/i18n'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import NewTenantClient from '@/components/admin/super-admin/NewTenantClient'

export default async function NewTenantPage() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
        redirect('/')
    }

    const dict = await getDictionary()

    return <NewTenantClient dict={dict} />
}
