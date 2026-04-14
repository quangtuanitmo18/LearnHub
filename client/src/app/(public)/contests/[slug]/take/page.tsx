import ContestsService from '@/services/contests';
import { notFound } from 'next/navigation';
import ContestTakeClient from './components/contest-take-client';

export const dynamic = 'force-dynamic';

interface ContestTakePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ContestTakePage = async (props: ContestTakePageProps) => {
  try {
    const params = await props.params;
    const contest = await ContestsService.getContestDetail(params.slug);

    if (!contest) {
      notFound();
    }

    return <ContestTakeClient contest={contest} />;
  } catch (error) {
    notFound();
  }
};

export default ContestTakePage;
