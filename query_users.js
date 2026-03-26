const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  console.log('Users:', users);
}).finally(async () => {
  await prisma.$disconnect();
});
