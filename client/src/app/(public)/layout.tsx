import dynamic from 'next/dynamic';

// Dynamic imports - default arrow function components
const MainHeader = dynamic(() => import('@/components/layout/main-header'));
const MainFooter = dynamic(() => import('@/components/layout/main-footer'));
const FloatingButtons = dynamic(() => import('@/components/floating-buttons'));

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">{children}</main>
      <MainFooter />
      <FloatingButtons telegramUrl="https://t.me/quangtuanitmo18" />
    </div>
  );
};

export default MainLayout;
