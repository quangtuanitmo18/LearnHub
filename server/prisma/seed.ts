import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  PERMISSIONS,
  SYSTEM_ROLE_NAMES,
} from '../src/shared/configs/permission';

const prisma = new PrismaService();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default roles with permissions
  const superAdminRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLE_NAMES.SUPER_ADMIN },
    update: {},
    create: {
      name: SYSTEM_ROLE_NAMES.SUPER_ADMIN,
      description: 'Super Administrator with all permissions',
      permissions: Object.values(PERMISSIONS),
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLE_NAMES.ADMIN },
    update: {},
    create: {
      name: SYSTEM_ROLE_NAMES.ADMIN,
      description: 'Administrator with user and post management permissions',
      permissions: [
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.BLOG_CREATE,
        PERMISSIONS.BLOG_READ,
        PERMISSIONS.BLOG_UPDATE,
        PERMISSIONS.BLOG_DELETE,
      ],
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLE_NAMES.STUDENT },
    update: {},
    create: {
      name: SYSTEM_ROLE_NAMES.STUDENT,
      description: 'Student with read-only permissions',
      permissions: [PERMISSIONS.BLOG_READ],
    },
  });

  const guestRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLE_NAMES.GUEST },
    update: {},
    create: {
      name: SYSTEM_ROLE_NAMES.GUEST,
      description: 'Guest with minimal permissions',
      permissions: [],
    },
  });

  // Create default super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      userType: 'DEFAULT',
      roles: {
        connect: { id: superAdminRole.id },
      },
    },
  });

  // Create a regular admin user
  const admin = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'manager@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      userType: 'DEFAULT',
      roles: {
        connect: { id: adminRole.id },
      },
    },
  });

  // Create a student user
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      username: 'student',
      email: 'student@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      userType: 'DEFAULT',
      roles: {
        connect: { id: studentRole.id },
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`📝 Created roles:`);
  console.log(
    `   - ${superAdminRole.name} (${superAdminRole.permissions.length} permissions)`,
  );
  console.log(
    `   - ${adminRole.name} (${adminRole.permissions.length} permissions)`,
  );
  console.log(
    `   - ${studentRole.name} (${studentRole.permissions.length} permissions)`,
  );
  console.log(
    `   - ${guestRole.name} (${guestRole.permissions.length} permissions)`,
  );

  console.log(`👥 Created users:`);
  console.log(`   - ${superAdmin.email} (Super Admin)`);
  console.log(`   - ${admin.email} (Admin)`);
  console.log(`   - ${student.email} (Student)`);
  console.log(`   Default password for all users: admin123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
