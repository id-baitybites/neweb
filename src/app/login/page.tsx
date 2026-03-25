import { getDictionary } from '@/i18n'
import LoginClient from '@/components/customer/LoginClient'

export default async function LoginPage({
    searchParams
}: {
    searchParams: Promise<{ returnUrl?: string }>
}) {
    const dict = await getDictionary()
    const sp = await searchParams
    const returnUrl = sp.returnUrl || '/'

    return <LoginClient dict={dict} returnUrl={returnUrl} />
}
