import { getDictionary } from '@/i18n'
import RegisterClient from '@/components/customer/RegisterClient'

export default async function RegisterPage() {
    const dict = await getDictionary()

    return <RegisterClient dict={dict} />
}
