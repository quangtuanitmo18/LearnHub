export const dynamic = 'force-dynamic';

import FloatingButtons from '@/components/floating-buttons';
import { MembershipPlans } from '@/components/membership';
import { generateHomeMetadata } from '@/components/seo';
import TetFlowerEffect from '@/components/tet-flower-effect';
import BlogsService from '@/services/blogs';
import CoursesService from '@/services/courses';
import BlogSection from './components/blog-section';
import FeaturedCoursesSection from './components/featured-courses-section';
import HeroSection from './components/hero-section';

// SEO Metadata for Home Page
export const metadata = generateHomeMetadata();

// Server-side data fetching function using existing services
async function fetchHomePageData() {
  const [coursesData, blogsData] = await Promise.all([
    CoursesService.getPublicCourses({ limit: 12 }),

    BlogsService.getPublishedBlogs({ limit: 4, page: 1 }),
  ]);

  return {
    courses: coursesData,
    blogs: blogsData,
  };
}

// Home page - Server Component with SSR
const HomePage = async () => {
  // Fetch data on server side
  const { courses, blogs } = await fetchHomePageData();

  return (
    <>
      <TetFlowerEffect />
      <HeroSection />
      <FeaturedCoursesSection coursesData={courses} />
      <MembershipPlans />
      <BlogSection blogsData={blogs} />
      <FloatingButtons telegramUrl="https://t.me/learnhub7phan" />
    </>
  );
};

export default HomePage;
