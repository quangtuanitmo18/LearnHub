import * as bcrypt from 'bcrypt';
import {
  PERMISSIONS,
  SYSTEM_ROLE_NAMES,
} from '../src/shared/configs/permission';
import { PrismaService } from '../src/shared/services/prisma.service';

const prisma = new PrismaService();

async function main() {
  console.log(
    '🌱 Đang dọn dẹp dữ liệu cũ (Xóa dữ liệu liên quan để seed mới)...',
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

  console.log('🌱 Bắt đầu tạo Role và Users...');

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

  console.log('🌱 Đang tạo Media (Unsplash Thumbnails)...');
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

  console.log('🌱 Đang tạo Khóa học (Courses), Chapters và Lessons...');
  const coursesData: any[] = [
    {
      title: 'Mastering Next.js 15 & NestJS: Fullstack E-Learning',
      slug: 'mastering-nextjs-nestjs-fullstack',
      description:
        'Khóa học toàn diện xây dựng hệ thống E-learning với Next.js 15 App Router ở Frontend và NestJS ở Backend. Chuẩn kiến trúc Microservices và RESTful API.',
      excerpt: 'Học cách xây dựng web app thực tế với Next.js và NestJS.',
      price: 1500000,
      oldPrice: 2500000,
      level: 'ADVANCED',
      categoryId: categories[0].id,
      imageId: medias[0].id,
    },
    {
      title: 'React Native IOS & Android',
      slug: 'react-native-ios-android',
      description:
        'Phát triển ứng dụng di động đa nền tảng tối ưu hiệu năng với React Native, Expo, Reanimated và Zustand.',
      excerpt: 'Làm chủ Mobile App Development.',
      price: 1200000,
      oldPrice: 1800000,
      level: 'INTERMEDIATE',
      categoryId: categories[1].id,
      imageId: medias[1].id,
    },
    {
      title: 'Trí tuệ Nhân tạo với Python (AI & Machine Learning)',
      slug: 'ai-machine-learning-python',
      description:
        'Cung cấp nền tảng Toán học, thống kê, và kỹ năng lập trình Python để huấn luyện các mô hình Machine Learning thực tế.',
      excerpt: 'Bước chân vào thế giới AI/ML chuyên nghiệp.',
      price: 2000000,
      oldPrice: 3000000,
      level: 'BEGINNER',
      categoryId: categories[2].id,
      imageId: medias[2].id,
    },
  ];

  for (const [index, courseData] of coursesData.entries()) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: {
        ...courseData,
        status: 'PUBLISHED',
        authorId: admin.id,
      },
    });

    // Tạo Chapters cho Course
    const ch1 = await prisma.chapter.create({
      data: {
        title: 'Chương 1: Giới thiệu khóa học và Thiết lập',
        order: 1,
        isPublished: true,
        courseId: course.id,
      },
    });

    const ch2 = await prisma.chapter.create({
      data: {
        title: 'Chương 2: Kiến thức Tiền đề',
        order: 2,
        isPublished: true,
        courseId: course.id,
      },
    });

    // Tạo Các Lessons (Video, Article, Quiz)

    // Bài 1: Video (Lấy tạm link Youtube)
    await prisma.lesson.create({
      data: {
        title: 'Bài 1: Giới thiệu tổng quan (Video)',
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

    // Bài 2: Article (Rich Text / Markdown)
    await prisma.lesson.create({
      data: {
        title: 'Bài 2: Hướng dẫn cài đặt file biến môi trường (Bài viết)',
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
              '<h2>1. Cài đặt biến môi trường</h2><p>Vui lòng sao chép nội dung file `.env.example` sang `.env` và điền Database URL.</p><br/><ul><li>Bước 1: Cài đặt Node.js</li><li>Bước 2: Sử dụng Docker để set up Database.</li></ul>',
            durationSec: 300,
          },
        },
      },
    });

    // Bài 3: Quiz (Trắc nghiệm)
    await prisma.lesson.create({
      data: {
        title: 'Bài 3: Trắc nghiệm kiến thức khởi tạo (Quiz)',
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
                  text: 'Ngôn ngữ chính sử dụng để code ứng dụng theo hướng Native Mobile là?',
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
                  text: 'Next.js 15 sử dụng mô hình nào để lấy dữ liệu mạnh mẽ nhất?',
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

  console.log('🌱 Đang tạo Bài viết chuyên sâu (Blogs)...');

  const longBlogContent1 = `
# Giải Phẫu Toàn Diện Kiến Trúc Microservices: Khi Hệ Thống Lớn Đòi Hỏi Sự Phân Tán

Trong thập kỷ vừa qua, kiến trúc Microservices đã trở thành tiêu chuẩn vàng cho các hệ thống phần mềm quy mô lớn. Từ Netflix, Uber cho đến các startup đang phát triển nhanh chóng, tất cả đều áp dụng kiến trúc này để giải quyết các hạn chế của Monolithic (kiến trúc nguyên khối).

Nhưng Microservices có thực sự là "chiếc đũa thần" giải quyết mọi bài toán? Hay nó lại mang đến một loạt các thách thức mới về mặt quản lý hệ thống phân tán? Giới hạn trong vài trang bài viết mở màn, chúng ta sẽ bắt đầu phân tích từ gốc rễ vấn đề.

## 1. Điểm Yếu Cốt Lõi Của Kiến Trúc Nguyên Khối (Monolithic)

Trước khi kiến trúc Microservices xuất hiện, Monolithic thống trị thế giới phát triển phần mềm. Mọi tính năng, luồng nghiệp vụ, cấu hình dữ liệu và cơ chế giao tiếp đều được gộp chung trong một "cục" duy nhất. 

### Ưu điểm
- **Dễ khởi đầu:** Chỉ cần 1 codebase.
- **Dễ theo dõi:** Tìm kiếm lỗi (tracing bugs) nằm trong 1 repo duy nhất.
- **Triển khai đơn giản:** Build tất cả thành 1 file duy nhất.

### Khuyết điểm 
Khi hệ thống có quy mô phát triển hơn:
1. **Khắc suất khi triển khai (Deployment Risk):** Một lỗi nhỏ ở logic thanh toán có thể làm chết toàn bộ website bao gồm cả hiển thị thông tin hay giao diện đăng kí.
2. **Quá tải tài nguyên con người:** Nhóm Backend 50 người không thể đồng thời làm việc trên cùng một repo vì những conflict Git nối tiếp.
3. **Mắc kẹt vĩnh viễn với Framework:** Đã chọn dùng NestJS thì toàn bộ phải dùng NestJS. Bạn không thể "cắm" một module Machine Learning bằng Python vào giữa nguyên khối bằng JavaScript một cách trực tiếp mà không ảnh hưởng cấu trúc.

---

## 2. Microservices Không Phải Là Giải Pháp Ma Thuật (Silver Bullet)

Dù mang lại khả năng phân tách trách nhiệm tối thượng tuyệt đẹp đến nhường nào, các developer cần hiểu rằng hệ thống microservices mang lại độ trễ cực cao trong môi trường giao tiếp Network.

### A. Giao Tiếp Triệu Gọi Trễ (Network Latency)
Các service không còn ở trong chung một process ở cấp bộ nhớ cục bộ mà phải băng qua đường cáp mạng nội bộ, gọi qua HTTP/TCP. Điều này kéo theo thời gian trễ lớn gấp 10 lần gọi In-memory. 
Vì lẽ này, **giao tiếp phi đồng bộ (Asynchronous Messaging)** thông qua RabbitMQ hoặc Kafka ra đời.

### B. Quản Trị Đa Dữ Liệu Phân Tán (Distributed Data Governance)
Transaction (giao dịch) từng được đảm bảo dễ dàng bằng ACID trong cơ sở dữ liệu quan hệ SQL. Nhưng khi Microservices nảy nở, thông tin một đơn hàng nằm ở Service A, thanh toán ở Service B và giao hàng ở Service C, bạn cần ứng dụng các thuật toán Event Sourcing hoặc Saga Pattern để xử lý khi tiến trình bị gián đoạn.

## 3. Lời Khuyên Dành Riêng Cho Người Mới Bắt Đầu

Bất cứ ai học về cấu trúc máy chủ cũng sẽ thích thú mô hình Microservices. Tuy nhiên, nếu bạn xây dựng một dự án một mình, khởi động bằng Monolithic (NestJS) được phân chia module nội bộ rõ ràng chính là phương pháp an toàn và hoàn hảo nhất. Đừng phân rã hệ thống khi hệ thống bạn còn chưa ra đời!

\n\n\n*(Hết nội dung)*
`;

  const longBlogContent2 = `
# Học UI/UX Nhập Môn: Làm Chủ Tính "Thẩm Mỹ Tối Giản" Để Tăng Tỷ Lệ Chuyển Đổi Khách Hàng

Giữa kỉ nguyên người dùng trở nên lướt nhanh hơn, tập trung ngắn hơn và lười đọc hơn, UI/UX tối giản không còn là một khuynh hướng thời trang nghệ thuật, mà trở thành công cụ ép buộc thiết yếu tạo ra doanh thu. Bài viết này trình bày phân tích các góc cạnh của "Sự tối giản" trong thiết kế sản phẩm.

## Sự Tối Giản Ở Giao Diện Không Phải Là Xóa Bỏ

Tối giản (Minimalism) thường xuyên bị hiểu nhầm là loại bỏ sạch chi tiết, sử dụng màu trắng phủ lên mọi nơi và chỉ để chữ.
Thực ra, tối giản là: 
- Xóa bỏ **sự nhiễu loạn thị giác (Visual Noise)**.
- Tập trung tuyệt đối vào **Hành động cốt lõi (Core Action)**.

### Màu sắc và Độ Tương Phản

Việc lựa chọn 1 màu chủ đạo, 1 màu hỗ trợ và vô vàn sắc thái của màu xám (từ trắng đến đen) giúp thị giác nghỉ ngơi mạnh mẽ. \n
Hơn nữa, một nguyên lý ít được để ý đến gọi là "60-30-10": 
- 60% Dành cho màu Nền (thường là màu xám nhạt/trắng)
- 30% Độ phủ của các màu sắc khác đi kèm phụ
- 10% Tập trung duy nhất cho "Call-to-Action", ví dụ: Màu Đỏ hoặc Cam nổi bần bật để thôi thúc người trải nghiệm click vào nút Mua ngay.

## Trải Nghiệm Người Dùng Và Sự Thấu Xót Trong Tính Khả Dụng (Usability)

Giao diện tốt chỉ chiếm 10% thành công khi UX chịu trách nhiệm 90% còn lại. Thiết kế tồi là khi nút "Hủy khóa học" ở rất to và rõ, trong khi nút "Lưu thay đổi" bé xíu góc màn hình. \n

Điều quan trọng nhất là bạn cần cung cấp một **Feedback Ngay Lập Tức** cho mọi hành vi người dùng bằng Skeleton, Spinner (Vòng tròn tải xoay vòng) thay vì để ứng dụng bất động.

...

Hành trình UI/UX là một kỉ nguyên vô tận để khám phá. Chúng ta hãy chú ý hơn vào đôi mắt của Khách hàng, khi đó sản phẩm tự nhiên sẽ trở nên xuất sắc.
`;

  await prisma.blog.upsert({
    where: { slug: 'giai-phau-kien-truc-microservices' },
    update: {},
    create: {
      title: 'Giải Phẫu Toàn Diện Kiến Trúc Microservices',
      slug: 'giai-phau-kien-truc-microservices',
      excerpt:
        'Hướng dẫn chi tiết, những thách thức cần vượt qua của Microservices.',
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
      title: 'Làm Chủ Tính "Thẩm Mỹ Tối Giản" Trong UI/UX',
      slug: 'hoc-ui-ux-toi-gian-va-chuyen-doi',
      excerpt:
        'Mối quan hệ giữa sự tĩnh lặng của thị giác và gia tăng lợi nhuận doanh nghiệp.',
      content: longBlogContent2,
      thumbnail:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      authorId: admin.id,
      categoryId: categories[3]?.id,
    },
  });

  console.log('✅ Hoàn tất toàn bộ qúa trình Seed Dữ Liệu chuẩn Production!');
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
