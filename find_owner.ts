import { prisma } from './src/lib/prisma';

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'baitybites' } });
  if (!tenant) {
    console.log('Tenant not found');
    return;
  }
  const users = await prisma.user.findMany({ where: { tenantId: tenant.id, role: 'OWNER' } });
  console.log('OWNERS:', users);
}

main();
