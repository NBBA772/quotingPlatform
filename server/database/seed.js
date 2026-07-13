const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create or find the AppAdmin
  const appAdmin = await prisma.appAdmin.upsert({
    where: { username: "appadmin" },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      username: 'appadmin',
      email: 'admin@businessbenefitalliance.com',
      password: '$2b$10$oohQTOrWSooMMv2eXrjJFeJcb6jY650.P1P3wYyS..zOtIUsSV44O', // hash this later!
    },
  });

  // Create or find the User linked to that AppAdmin
  const user = await prisma.user.upsert({
    where: { username: "appadmin" },
    update: { appAdminId: appAdmin.id },
    create: {
      email: 'admin@businessbenefitalliance.com',
      password: '35e2160406b89bc5d5e2f5a0e467ddaf',
      firstName: 'Super',
      lastName: 'Admin',
      username: 'appadmin',
      appAdminId: appAdmin.id,
    },
  });

  console.log('✅ AppAdmin created:', appAdmin);
  console.log('✅ User linked to AppAdmin:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
