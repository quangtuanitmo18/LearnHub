import ContestsService from '@/services/contests';

import ContestsContent from './components/contests-content';
import ContestsHeader from './components/contests-header';

export const dynamic = 'force-dynamic';

async function fetchInitialContestsData() {
  try {
    return await ContestsService.getPublicContests();
  } catch {
    return [];
  }
}

const ContestsPage = async () => {
  const initialContests = await fetchInitialContestsData();

  return (
    <>
      <ContestsHeader />
      <ContestsContent initialContests={initialContests} />
    </>
  );
};

export default ContestsPage;
