import { resolveTenant } from '@/lib/tenant'
import CartClient from '../../components/customer/CartClient'

export default async function CartPage() {
    const tenant = await resolveTenant()

    return (
        <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
            <div className="container" style={{ margin: '0 auto', maxWidth: '1200px' }}>
                <CartClient tenantId={tenant?.id} />
            </div>
        </div>
    )
}
