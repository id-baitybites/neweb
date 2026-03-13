import { prisma } from './src/lib/prisma';

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: {
      users: {
        where: { role: 'OWNER' }
      }
    }
  });

  console.log('--- TENANT LOGIN CREDENTIALS (TEST) ---');
  tenants.forEach(tenant => {
    console.log(`\nStore: ${tenant.name} (${tenant.slug})`);
    if (tenant.users.length > 0) {
      tenant.users.forEach(user => {
        console.log(`- Email: ${user.email}`);
        console.log(`- URL: http://${tenant.slug}.localhost:7277/admin`);
      });
    } else {
      console.log('- No owner account found.');
    }
  });

  // Also check Super Admins
  const superAdmins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' }
  });
  console.log('\n--- SUPER ADMIN (PLATFORM) ---');
  superAdmins.forEach(admin => {
    console.log(`- Email: ${admin.email}`);
    console.log(`- URL: http://localhost:7277/super-admin`);
  });
  
  console.log('\nCommon Test Password: password123');
}

main();
