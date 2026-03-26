const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.tenant.findMany().then(tenants => {
  console.log('Tenants:', tenants.map(t => ({ id: t.id, name: t.name, domain: t.domain })));
}).finally(async () => {
  await prisma.$disconnect();
});
