import type { Metadata } from 'next';
import InstructorsHeader from './components/instructors-header';
import InstructorsContent from './components/instructors-content';

export const metadata: Metadata = {
  title: 'Instructors | LearnHub',
  description:
    'Meet our expert instructors — industry practitioners and thought leaders ready to guide your learning journey.',
};

const InstructorsPage = () => {
  return (
    <>
      <InstructorsHeader />
      <InstructorsContent />
    </>
  );
};

export default InstructorsPage;
