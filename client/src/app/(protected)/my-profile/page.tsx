'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// Static import for always-visible sidebar (critical)
import ProfileSidebar from './components/profile-sidebar';
import type { ProfileTab } from './components/profile-sidebar';

// Dynamic imports for tab components (user-specific, interactive)
const MyCoursesTab = dynamic(() => import('./components/my-courses-tab'), {
  ssr: false,
});

const ProfileInfoTab = dynamic(() => import('./components/profile-info-tab'), {
  ssr: false,
});

const MyPostsTab = dynamic(() => import('./components/my-posts-tab'), {
  ssr: false,
});

const SettingsTab = dynamic(() => import('./components/settings-tab'), {
  ssr: false,
});

const GamificationTab = dynamic(() => import('./components/gamification-tab'), { ssr: false });

const CertificatesTab = dynamic(() => import('./components/certificates-tab'), { ssr: false });

// Main profile page - Arrow function
const MyProfilePage = () => {
  const searchParams = useSearchParams();

  const getInitialTab = (): ProfileTab => {
    const tab = searchParams.get('tab');
    if (
      tab === 'account' ||
      tab === 'courses' ||
      tab === 'posts' ||
      tab === 'settings' ||
      tab === 'achievements' ||
      tab === 'certificates'
    ) {
      return tab;
    }
    return 'account';
  };

  const [activeTab, setActiveTab] = useState<ProfileTab>(getInitialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (
      tab === 'account' ||
      tab === 'courses' ||
      tab === 'posts' ||
      tab === 'settings' ||
      tab === 'achievements' ||
      tab === 'certificates'
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Render tab content - Arrow function
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <ProfileInfoTab />;
      case 'courses':
        return <MyCoursesTab />;
      case 'posts':
        return <MyPostsTab />;
      case 'achievements':
        return <GamificationTab />;
      case 'certificates':
        return <CertificatesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProfileInfoTab />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default MyProfilePage;
