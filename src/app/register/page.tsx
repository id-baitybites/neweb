import { getDictionary } from '@/i18n'
import RegisterClient from '@/components/customer/RegisterClient'
import { resolveTenant } from '@/lib/tenant'

export default async function RegisterPage() {
    const dict = await getDictionary()

    const tenant = await resolveTenant()

    return <RegisterClient dict={dict} tenantSlug={tenant?.slug} />
}
