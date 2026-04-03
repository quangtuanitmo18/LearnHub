import * as bcrypt from 'bcrypt';
import {
  PERMISSIONS,
  SYSTEM_ROLE_NAMES,
} from '../src/shared/configs/permission';
import { PrismaService } from '../src/shared/services/prisma.service';

const prisma = new PrismaService();

async function main() {
  console.log(
    '🌱 Cleaning up old data (Deleting related data to seed from scratch)...',
  );

  // Safe cleanup sequence - honoring FK constraints
  await prisma.notificationRecipient.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commentReaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.userLessonProgress.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.lessonQuiz.deleteMany();
  await prisma.lessonVideo.deleteMany();
  await prisma.lessonArticle.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.course.deleteMany();
  await prisma.media.deleteMany();
  await prisma.category.deleteMany();
  await prisma.instructorProfile.deleteMany();

  console.log('🌱 Starting to create Roles and Users...');

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
        PERMISSIONS.COURSE_CREATE,
        PERMISSIONS.COURSE_READ,
        PERMISSIONS.COURSE_UPDATE,
        PERMISSIONS.COURSE_DELETE,
      ],
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLE_NAMES.STUDENT },
    update: {},
    create: {
      name: SYSTEM_ROLE_NAMES.STUDENT,
      description: 'Student with read-only permissions',
      permissions: [PERMISSIONS.BLOG_READ, PERMISSIONS.COURSE_READ],
    },
  });

  const instructorRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLE_NAMES.INSTRUCTOR },
    update: {},
    create: {
      name: SYSTEM_ROLE_NAMES.INSTRUCTOR,
      description: 'Instructor with course management permissions',
      permissions: [
        PERMISSIONS.COURSE_CREATE,
        PERMISSIONS.COURSE_READ,
        PERMISSIONS.COURSE_UPDATE,
        PERMISSIONS.COURSE_DELETE,
        PERMISSIONS.VIDEO_CREATE,
        PERMISSIONS.VIDEO_READ,
        PERMISSIONS.VIDEO_UPDATE,
        PERMISSIONS.VIDEO_DELETE,
        PERMISSIONS.IMAGE_CREATE,
        PERMISSIONS.IMAGE_READ,
        PERMISSIONS.IMAGE_UPDATE,
        PERMISSIONS.IMAGE_DELETE,
        PERMISSIONS.BLOG_READ,
        PERMISSIONS.BLOG_CREATE,
      ],
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      roles: { connect: { id: superAdminRole.id } },
    },
  });

  // Multiple Students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@example.com` },
      update: {},
      create: {
        username: `Student ${i}`,
        email: `student${i}@example.com`,
        password: studentPassword,
        status: 'ACTIVE',
        avatar: `https://i.pravatar.cc/150?u=student${i}`,
        roles: { connect: { id: studentRole.id } },
      },
    });
    students.push(student);
  }

  // Instructors
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      username: 'Alex Master',
      email: 'instructor@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
      roles: { connect: { id: instructorRole.id } },
      instructorProfile: {
        create: {
          headline: 'Senior Engineering Leader & Tech Content Creator',
          bio: 'Alex is a Senior Engineering Leader with over 10 years of experience building modern web applications.',
          website: 'https://alexmaster.dev',
        },
      },
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'sarah.chen@example.com' },
    update: {},
    create: {
      username: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      roles: { connect: { id: instructorRole.id } },
      instructorProfile: {
        create: {
          headline: 'Lead Mobile Developer & UI/UX Expert',
          bio: 'Sarah is an expert in React Native, Flutter, and minimalist design systems.',
          website: 'https://sarahchen.dev',
        },
      },
    },
  });

  console.log('✅ Users populated');
  console.log('🌱 Creating Categories & Media...');

  const categoriesData = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Mobile Development', slug: 'mobile-development' },
    { name: 'Data Science & AI', slug: 'data-science-ai' },
    { name: 'UI/UX Design', slug: 'ui-ux-design' },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      }),
    ),
  );

  const mediaData = [
    {
      storageKey:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200',
      filename: 'react-course.jpg',
    },
    {
      storageKey:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200',
      filename: 'mobile-course.jpg',
    },
    {
      storageKey:
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200',
      filename: 'ai-course.jpg',
    },
    {
      storageKey:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200',
      filename: 'design-course.jpg',
    },
  ];

  const medias = await Promise.all(
    mediaData.map((m) =>
      prisma.media.upsert({
        where: { storageKey: m.storageKey },
        update: {},
        create: {
          userId: admin.id,
          filename: m.filename,
          size: 154200n,
          mimetype: 'image/jpeg',
          type: 'IMAGE',
          storageKey: m.storageKey,
          cdnBaseUrl: '',
          status: 'COMPLETED',
        },
      }),
    ),
  );

  console.log('🌱 Creating Courses, Chapters and Lessons...');

  // Course 1
  const course1 = await prisma.course.upsert({
    where: { slug: 'mastering-nextjs-nestjs-fullstack' },
    update: {},
    create: {
      title: 'Mastering Next.js 15 & NestJS: Fullstack E-Learning',
      slug: 'mastering-nextjs-nestjs-fullstack',
      description:
        'A comprehensive course on building production-ready E-learning systems with Next.js 15 App Router on the Frontend and NestJS on the Backend, using Microservices and RESTful API architectures.',
      excerpt: 'Learn to build real-world web apps with Next.js and NestJS.',
      price: 149.99,
      oldPrice: 249.99,
      level: 'ADVANCED',
      categoryId: categories.find((c) => c.slug === 'web-development')?.id,
      imageId: medias[0].id,
      authorId: instructor.id,
      status: 'PUBLISHED',
      view: 1205,
      sold: 340,
    },
  });

  const c1Ch1 = await prisma.chapter.create({
    data: {
      title: 'Chapter 1: Course Introduction and Setup',
      order: 1,
      isPublished: true,
      courseId: course1.id,
    },
  });

  const c1Ch2 = await prisma.chapter.create({
    data: {
      title: 'Chapter 2: Backend Architecture in NestJS',
      order: 2,
      isPublished: true,
      courseId: course1.id,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Lesson 1: Overview and Introduction (Video)',
      type: 'VIDEO',
      slug: `lesson1-c1`,
      order: 1,
      published: true,
      courseId: course1.id,
      chapterId: c1Ch1.id,
      durationSec: 640,
      video: {
        create: {
          url: 'https://www.youtube.com/watch?v=kYIIfiJ7d50',
          durationSec: 640,
        },
      },
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Lesson 2: Environment Variable Setup Guide (Article)',
      type: 'ARTICLE',
      slug: `lesson2-c1`,
      order: 2,
      published: true,
      courseId: course1.id,
      chapterId: c1Ch1.id,
      durationSec: 300,
      article: {
        create: {
          content:
            '<h2>1. Setup Environment Variables</h2><p>Please copy the contents of `.env.example` to a new `.env` file.</p>',
          durationSec: 300,
        },
      },
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Lesson 3: Introductory Knowledge Test (Quiz)',
      type: 'QUIZ',
      slug: `lesson3-c1`,
      order: 3,
      published: true,
      courseId: course1.id,
      chapterId: c1Ch1.id,
      durationSec: 1200,
      quiz: {
        create: {
          passScore: 80,
          maxAttempts: 3,
          durationSec: 1200,
          questions: {
            create: [
              {
                type: 'SINGLE_CHOICE',
                text: 'Which data fetching model is most heavily promoted in Next.js 15?',
                order: 1,
                points: 10,
                options: {
                  create: [
                    { text: 'Server Components', isCorrect: true, order: 1 },
                    { text: 'Client Fetching', isCorrect: false, order: 2 },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  // Course 2
  const course2 = await prisma.course.upsert({
    where: { slug: 'react-native-ios-android' },
    update: {},
    create: {
      title: 'React Native IOS & Android',
      slug: 'react-native-ios-android',
      description:
        'Develop cross-platform mobile applications optimized for performance using React Native, Expo, Reanimated, and Zustand.',
      excerpt: 'Master Mobile App Development.',
      price: 119.99,
      level: 'INTERMEDIATE',
      categoryId: categories.find((c) => c.slug === 'mobile-development')?.id,
      imageId: medias[1].id,
      authorId: instructor2.id,
      status: 'PUBLISHED',
      view: 840,
      sold: 150,
    },
  });

  const c2Ch1 = await prisma.chapter.create({
    data: {
      title: 'Chapter 1: Expo Setup',
      order: 1,
      isPublished: true,
      courseId: course2.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Getting started with Expo and React Native',
      type: 'VIDEO',
      slug: 'c2-lesson-1',
      order: 1,
      published: true,
      courseId: course2.id,
      chapterId: c2Ch1.id,
      video: {
        create: { url: 'https://youtube.com/watch?v=123', durationSec: 900 },
      },
    },
  });

  console.log('🌱 Creating Coupons...');
  const discountAll = await prisma.coupon.upsert({
    where: { code: 'SUMMER2025' },
    update: {},
    create: {
      title: 'Summer Sale 20%',
      code: 'SUMMER2025',
      discountType: 'PERCENT',
      discountValue: 20,
      maxUses: 100,
      usedCount: 15,
      isActive: true,
      courses: { connect: [{ id: course1.id }, { id: course2.id }] },
    },
  });

  console.log('🌱 Creating Orders & Engagement Data...');

  // Orders
  await prisma.order.create({
    data: {
      code: 'ORD-PROD-001',
      userId: students[0].id,
      orderType: 'COURSE',
      couponCode: discountAll.code,
      subTotal: 149.99,
      totalDiscount: 30, // 20%
      totalAmount: 119.99,
      paymentMethod: 'STRIPE',
      status: 'COMPLETED',
      items: {
        create: [
          { title: course1.title || '', price: 119.99, courseId: course1.id },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      code: 'ORD-PROD-002',
      userId: students[1].id,
      orderType: 'COURSE',
      subTotal: 119.99,
      totalDiscount: 0,
      totalAmount: 119.99,
      paymentMethod: 'BANK_TRANSFER',
      status: 'COMPLETED',
      items: {
        create: [
          { title: course2.title || '', price: 119.99, courseId: course2.id },
        ],
      },
    },
  });

  // User Progress
  await prisma.userLessonProgress.create({
    data: {
      userId: students[0].id,
      courseId: course1.id,
      lessonId: lesson1.id,
    },
  });

  // Interactive Comments
  const mainComment = await prisma.comment.create({
    data: {
      lessonId: lesson1.id,
      userId: students[0].id,
      content:
        'This introductory video was amazing! Very easy to understand for beginners.',
      status: 'APPROVED',
      level: 0,
    },
  });

  await prisma.comment.create({
    data: {
      lessonId: lesson1.id,
      userId: instructor.id,
      parentId: mainComment.id,
      content:
        'Glad you liked it! We will dive deeper into Microservices in Chapter 2.',
      status: 'APPROVED',
      level: 1,
    },
  });

  await prisma.commentReaction.create({
    data: { commentId: mainComment.id, userId: students[1].id, type: 'LIKE' },
  });

  // Reviews
  await prisma.review.create({
    data: {
      userId: students[0].id,
      courseId: course1.id,
      star: 5,
      content: 'Hands down the best NextJS course out there.',
      status: 'APPROVED',
    },
  });
  await prisma.review.create({
    data: {
      userId: students[1].id,
      courseId: course1.id,
      star: 4,
      content: 'Very informative, but slightly too fast in chapter 2.',
      status: 'APPROVED',
    },
  });

  console.log('🌱 Creating Notifications...');
  await prisma.notification.create({
    data: {
      type: 'PAYMENT',
      title: 'Payment Successful',
      message:
        'Your payment for Mastering Next.js 15 & NestJS has been completed.',
      recipients: { create: [{ userId: students[0].id, isRead: false }] },
    },
  });

  console.log('🌱 Creating High Quality Blogs...');
  const longBlogContent1 = `
  <h1>A Comprehensive Anatomy of Microservices Architecture: When Large Systems Demand Decentralization</h1>
  <p>Over the past decade, Microservices architecture has become the gold standard for large-scale software systems. From Netflix and Uber to fast-growing startups, everyone is adopting this architecture to overcome the limitations of the Monolithic approach.</p>
  <p>But is Microservices truly a "magic wand" that solves all problems? Or does it bring a new set of challenges regarding distributed system management? In this introductory article, we will start analyzing from the root of the problem.</p>
  <h2>1. Core Weaknesses of Monolithic Architecture</h2>
  <p>Before Microservices emerged, Monolithic architecture dominated the software development world. Every feature, business flow, data configuration, and communication mechanism was bundled into a single unit.</p>
  <h3>Advantages</h3>
  <ul>
    <li><strong>Easy to start:</strong> Only requires 1 codebase.</li>
    <li><strong>Easy to monitor:</strong> Tracing bugs happens in a single repository.</li>
    <li><strong>Simple deployment:</strong> Builds everything into a single artifact.</li>
  </ul>
  <h3>Disadvantages</h3>
  <p>As the system scales:</p>
  <ol>
    <li><strong>Deployment Risk:</strong> A minor bug in payment logic can crash the entire website, including the homepage or registration interface.</li>
    <li><strong>Human Resource Overload:</strong> A backend team of 50 people cannot work simultaneously on the same repository without causing endless Git conflicts.</li>
  </ol>
  <hr />
  <h2>2. Microservices Is Not A Silver Bullet</h2>
  <p>Despite offering incredibly beautiful segregation of responsibilities, developers must understand that microservices architecture introduces significant latency in the network communication environment.</p>
  `;

  const longBlogContent2 = `
  <h1>UI/UX for Beginners: Mastering "Minimalist Aesthetics" to Boost Conversion Rates</h1>
  <p>In an era where users scroll faster, have shorter attention spans, and are lazier to read, minimalist UI/UX is no longer just an artistic fashion trend—it has become a mandatory tool for generating revenue. This article presents an analysis of various angles of "Minimalism" in product design.</p>
  <h2>Minimalism in Interfaces Is Not Erasure</h2>
  <p>Minimalism is constantly misunderstood as wiping out all details, painting everything white, and leaving only text. In reality, minimalism means: </p>
  <ul>
    <li>Eliminating <strong>Visual Noise</strong>.</li>
    <li>Focusing absolutely on the <strong>Core Action (Call-to-Action)</strong>.</li>
  </ul>
  <h3>Color and Contrast</h3>
  <p>Choosing 1 primary color, 1 secondary color, and countless shades of gray (from white to black) gives the eyes a strong visual rest.</p>
  <p>Furthermore, a crucial but often overlooked principle is the "60-30-10" rule: </p>
  <ul>
    <li>60% assigned to the Background color (usually light gray/white)</li>
    <li>30% coverage for accompanying secondary colors</li>
    <li>10% exclusive focus for the "Call-to-Action", for example: Vivid Red or Orange to urge the user to click the "Buy Now" button.</li>
  </ul>
  <h2>User Experience and Empathy in Usability</h2>
  <p>A good interface only accounts for 10% of success, while UX is responsible for the remaining 90%.</p>
  `;

  await prisma.blog.upsert({
    where: { slug: 'anatomy-of-microservices-architecture' },
    update: {},
    create: {
      title: 'A Comprehensive Anatomy of Microservices Architecture',
      slug: 'anatomy-of-microservices-architecture',
      excerpt: 'A detailed guide uncovering the challenges of Microservices.',
      content: longBlogContent1,
      thumbnail: medias[0].storageKey,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: instructor.id,
      categoryId: categories.find((c) => c.slug === 'web-development')?.id,
    },
  });

  await prisma.blog.upsert({
    where: { slug: 'mastering-minimalist-aesthetics-in-ui-ux' },
    update: {},
    create: {
      title: 'Mastering "Minimalist Aesthetics" in UI/UX',
      slug: 'mastering-minimalist-aesthetics-in-ui-ux',
      excerpt:
        'The relationship between visual silence and increasing business revenue.',
      content: longBlogContent2,
      thumbnail: medias[3].storageKey,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      authorId: instructor2.id,
      categoryId: categories.find((c) => c.slug === 'ui-ux-design')?.id,
    },
  });

  console.log('✅ Completed the Production-ready Data Seeding process!');
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
