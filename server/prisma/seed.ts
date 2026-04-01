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
  await prisma.commentReaction.deleteMany();
  await prisma.comment.deleteMany();
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
  await prisma.course.deleteMany();
  await prisma.media.deleteMany();
  await prisma.category.deleteMany();

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

  const guestRole = await prisma.role.upsert({
    where: { name: SYSTEM_ROLE_NAMES.GUEST },
    update: {},
    create: {
      name: SYSTEM_ROLE_NAMES.GUEST,
      description: 'Guest with minimal permissions',
      permissions: [],
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

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      username: 'Alex Master',
      email: 'instructor@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      userType: 'DEFAULT',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
      roles: {
        connect: { id: instructorRole.id },
      },
      instructorProfile: {
        create: {
          headline: 'Senior Engineering Leader & Tech Content Creator',
          bio: 'Alex is a Senior Engineering Leader with over 10 years of experience building modern web applications. He specializes in React, Next.js, and Node.js ecosystems.',
          website: 'https://alexmaster.dev',
          youtube: 'https://youtube.com/@alexmaster',
          linkedin: 'https://linkedin.com/in/alexmaster',
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
      userType: 'DEFAULT',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
      roles: {
        connect: { id: instructorRole.id },
      },
      instructorProfile: {
        create: {
          headline: 'Lead Mobile Developer & UI/UX Expert',
          bio: 'Sarah is a mobile engineering expert with a passion for building beautiful, high-performance cross-platform applications using React Native and Flutter. She has helped scale mobile teams at top tech startups.',
          website: 'https://sarahchen.dev',
          youtube: 'https://youtube.com/@sarahcodes',
          linkedin: 'https://linkedin.com/in/sarahchen',
        },
      },
    },
  });

  const instructor3 = await prisma.user.upsert({
    where: { email: 'marcus.j@example.com' },
    update: {},
    create: {
      username: 'Marcus Johnson',
      email: 'marcus.j@example.com',
      password: hashedPassword,
      status: 'ACTIVE',
      userType: 'DEFAULT',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      roles: {
        connect: { id: instructorRole.id },
      },
      instructorProfile: {
        create: {
          headline: 'Data Scientist & AI Researcher',
          bio: 'Marcus is a Data Scientist with a PhD in Machine Learning. He demystifies complex AI concepts and teaches practical implementations using Python, TensorFlow, and PyTorch.',
          website: 'https://marcusai.io',
          youtube: 'https://youtube.com/@marcus_o_ai',
          linkedin: 'https://linkedin.com/in/marcusjohnson',
        },
      },
    },
  });

  console.log('✅ Đã tạo Roles và Users thành công!');
  console.log('🌱 Đang tạo Categories (Danh mục khóa học)...');
  const categoriesData = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Mobile Development', slug: 'mobile-development' },
    { name: 'Data Science & AI', slug: 'data-science-ai' },
    { name: 'UI/UX Design', slug: 'ui-ux-design' },
  ];

  const categories: any[] = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    });
    categories.push(created);
  }

  console.log('🌱 Creating Media (Unsplash Thumbnails)...');
  const mediaData = [
    {
      storageKey:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200', // React / Web
      filename: 'react-course.jpg',
    },
    {
      storageKey:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200', // Mobile
      filename: 'mobile-course.jpg',
    },
    {
      storageKey:
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200', // Data Science / AI
      filename: 'ai-course.jpg',
    },
    {
      storageKey:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200', // Design
      filename: 'design-course.jpg',
    },
  ];

  const medias: any[] = [];
  for (const m of mediaData) {
    const media = await prisma.media.upsert({
      where: { storageKey: m.storageKey },
      update: {},
      create: {
        userId: admin.id,
        filename: m.filename,
        size: 154200,
        mimetype: 'image/jpeg',
        type: 'IMAGE',
        storageKey: m.storageKey,
        cdnBaseUrl: '',
        status: 'COMPLETED',
      },
    });
    medias.push(media);
  }

  console.log('🌱 Creating Courses, Chapters and Lessons...');
  const coursesData: any[] = [
    {
      title: 'Mastering Next.js 15 & NestJS: Fullstack E-Learning',
      slug: 'mastering-nextjs-nestjs-fullstack',
      description:
        'A comprehensive course on building production-ready E-learning systems with Next.js 15 App Router on the Frontend and NestJS on the Backend, using Microservices and RESTful API architectures.',
      excerpt: 'Learn to build real-world web apps with Next.js and NestJS.',
      price: 1500000,
      oldPrice: 2500000,
      level: 'ADVANCED',
      categoryId: categories[0].id,
      imageId: medias[0].id,
      authorId: instructor.id,
    },
    {
      title: 'React Native IOS & Android',
      slug: 'react-native-ios-android',
      description:
        'Develop cross-platform mobile applications optimized for performance using React Native, Expo, Reanimated, and Zustand.',
      excerpt: 'Master Mobile App Development.',
      price: 1200000,
      oldPrice: 1800000,
      level: 'INTERMEDIATE',
      categoryId: categories[1].id,
      imageId: medias[1].id,
      authorId: instructor2.id,
    },
    {
      title: 'Artificial Intelligence with Python (AI & Machine Learning)',
      slug: 'ai-machine-learning-python',
      description:
        'Provides a solid foundation in Mathematics, statistics, and Python programming skills to train practical Machine Learning models.',
      excerpt: 'Step into the world of professional AI/ML.',
      price: 2000000,
      oldPrice: 3000000,
      level: 'BEGINNER',
      categoryId: categories[2].id,
      imageId: medias[2].id,
      authorId: instructor3.id,
    },
  ];

  for (const [index, courseData] of coursesData.entries()) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: {
        ...courseData,
        status: 'PUBLISHED',
      },
    });

    // Create Chapters for Course
    const ch1 = await prisma.chapter.create({
      data: {
        title: 'Chapter 1: Course Introduction and Setup',
        order: 1,
        isPublished: true,
        courseId: course.id,
      },
    });

    const ch2 = await prisma.chapter.create({
      data: {
        title: 'Chapter 2: Prerequisites',
        order: 2,
        isPublished: true,
        courseId: course.id,
      },
    });

    // Create Lessons (Video, Article, Quiz)

    // Lesson 1: Video (Temporary Youtube link)
    await prisma.lesson.create({
      data: {
        title: 'Lesson 1: Overview and Introduction (Video)',
        type: 'VIDEO',
        slug: `${course.slug}-lesson-overview`,
        order: 1,
        published: true,
        courseId: course.id,
        chapterId: ch1.id,
        durationSec: 640,
        video: {
          create: {
            url: 'https://www.youtube.com/watch?v=kYIIfiJ7d50',
            durationSec: 640,
          },
        },
      },
    });

    // Lesson 2: Article (Rich Text / Markdown)
    await prisma.lesson.create({
      data: {
        title: 'Lesson 2: Environment Variable Setup Guide (Article)',
        type: 'ARTICLE',
        slug: `${course.slug}-lesson-env-setup`,
        order: 2,
        published: true,
        courseId: course.id,
        chapterId: ch1.id,
        durationSec: 300,
        article: {
          create: {
            content:
              '<h2>1. Setup Environment Variables</h2><p>Please copy the contents of `.env.example` to a new `.env` file and configure the Database URL.</p><br/><ul><li>Step 1: Install Node.js</li><li>Step 2: Use Docker to set up the Database.</li></ul>',
            durationSec: 300,
          },
        },
      },
    });

    // Lesson 3: Quiz (Multiple Choice)
    await prisma.lesson.create({
      data: {
        title: 'Lesson 3: Introductory Knowledge Test (Quiz)',
        type: 'QUIZ',
        slug: `${course.slug}-lesson-quiz-1`,
        order: 3,
        published: true,
        courseId: course.id,
        chapterId: ch2.id,
        durationSec: 1200,
        quiz: {
          create: {
            passScore: 80,
            maxAttempts: 3,
            durationSec: 1200,
            questions: {
              create: [
                {
                  type: 'MULTIPLE_CHOICE',
                  text: 'What are the main programming languages used for developing Native Mobile applications?',
                  order: 1,
                  points: 10,
                  options: {
                    create: [
                      { text: 'HTML & CSS', isCorrect: false, order: 1 },
                      { text: 'Kotlin & Swift', isCorrect: true, order: 2 },
                      { text: 'Python', isCorrect: false, order: 3 },
                    ],
                  },
                },
                {
                  type: 'SINGLE_CHOICE',
                  text: 'Which data fetching model is most heavily promoted in Next.js 15?',
                  order: 2,
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
  }

  console.log('🌱 Creating in-depth articles (Blogs)...');

  const longBlogContent1 = `
# A Comprehensive Anatomy of Microservices Architecture: When Large Systems Demand Decentralization

Over the past decade, Microservices architecture has become the gold standard for large-scale software systems. From Netflix and Uber to fast-growing startups, everyone is adopting this architecture to overcome the limitations of the Monolithic approach.

But is Microservices truly a "magic wand" that solves all problems? Or does it bring a new set of challenges regarding distributed system management? In this introductory article, we will start analyzing from the root of the problem.

## 1. Core Weaknesses of Monolithic Architecture

Before Microservices emerged, Monolithic architecture dominated the software development world. Every feature, business flow, data configuration, and communication mechanism was bundled into a single unit.

### Advantages
- **Easy to start:** Only requires 1 codebase.
- **Easy to monitor:** Tracing bugs happens in a single repository.
- **Simple deployment:** Builds everything into a single artifact.

### Disadvantages 
As the system scales:
1. **Deployment Risk:** A minor bug in payment logic can crash the entire website, including the homepage or registration interface.
2. **Human Resource Overload:** A backend team of 50 people cannot work simultaneously on the same repository without causing endless Git conflicts.
3. **Framework Lock-in:** Once you choose NestJS, everything must use NestJS. You cannot simply "plug in" a Python Machine Learning module directly into a JavaScript monolith without disrupting the structure.

---

## 2. Microservices Is Not A Silver Bullet

Despite offering incredibly beautiful segregation of responsibilities, developers must understand that microservices architecture introduces significant latency in the network communication environment.

### A. Network Latency
Services no longer reside in the same process at the local memory level; they must cross internal network cables via HTTP/TCP protocols. This increases latency up to 10 times compared to In-memory calls. 
For this reason, **Asynchronous Messaging** via RabbitMQ or Kafka was born.

### B. Distributed Data Governance
Transactions were once easily guaranteed by ACID properties in relational SQL databases. But when Microservices flourish, an order's information is in Service A, payment in Service B, and delivery in Service C. You must implement algorithms like Event Sourcing or the Saga Pattern to handle interrupted processes.

## 3. Advice for Beginners

Anyone studying server architecture will find the Microservices model fascinating. However, if you are building a solo project, starting with a Monolith (like NestJS) that is clearly modularized internally is the safest and most perfect approach. Do not decompose your system before it has even launched!

\n\n\n*(End of article)*
`;

  const longBlogContent2 = `
# UI/UX for Beginners: Mastering "Minimalist Aesthetics" to Boost Conversion Rates

In an era where users scroll faster, have shorter attention spans, and are lazier to read, minimalist UI/UX is no longer just an artistic fashion trend—it has become a mandatory tool for generating revenue. This article presents an analysis of various angles of "Minimalism" in product design.

## Minimalism in Interfaces Is Not Erasure

Minimalism is constantly misunderstood as wiping out all details, painting everything white, and leaving only text.
In reality, minimalism means: 
- Eliminating **Visual Noise**.
- Focusing absolutely on the **Core Action (Call-to-Action)**.

### Color and Contrast

Choosing 1 primary color, 1 secondary color, and countless shades of gray (from white to black) gives the eyes a strong visual rest. \n
Furthermore, a crucial but often overlooked principle is the "60-30-10" rule: 
- 60% assigned to the Background color (usually light gray/white)
- 30% coverage for accompanying secondary colors
- 10% exclusive focus for the "Call-to-Action", for example: Vivid Red or Orange to urge the user to click the "Buy Now" button.

## User Experience and Empathy in Usability

A good interface only accounts for 10% of success, while UX is responsible for the remaining 90%. Bad design is when the "Cancel Subscription" button is huge and prominent, while the "Save Changes" button is tiny in the corner of the screen. \n

The most critical aspect is providing **Immediate Feedback** for every user action using Skeletons or Spinners instead of leaving the application seemingly frozen.

...

The UI/UX journey is an endless era to explore. Let us pay closer attention to our customers' eyes; when we do, the product will naturally become excellent.
`;

  await prisma.blog.upsert({
    where: { slug: 'giai-phau-kien-truc-microservices' },
    update: {},
    create: {
      title: 'A Comprehensive Anatomy of Microservices Architecture',
      slug: 'giai-phau-kien-truc-microservices',
      excerpt: 'A detailed guide uncovering the challenges of Microservices.',
      content: longBlogContent1,
      thumbnail:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: categories[0].id,
    },
  });

  await prisma.blog.upsert({
    where: { slug: 'hoc-ui-ux-toi-gian-va-chuyen-doi' },
    update: {},
    create: {
      title: 'Mastering "Minimalist Aesthetics" in UI/UX',
      slug: 'hoc-ui-ux-toi-gian-va-chuyen-doi',
      excerpt:
        'The relationship between visual silence and increasing business revenue.',
      content: longBlogContent2,
      thumbnail:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      authorId: admin.id,
      categoryId: categories[3]?.id,
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
