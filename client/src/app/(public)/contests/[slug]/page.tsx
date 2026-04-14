import ContestsService from '@/services/contests';
import { notFound } from 'next/navigation';
import ContestDetailClient from './components/contest-detail-client';

export const dynamic = 'force-dynamic';

interface ContestDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getContest(slug: string) {
  try {
    return await ContestsService.getContestDetail(slug);
  } catch {
    return null;
  }
}

const ContestDetailPage = async (props: ContestDetailPageProps) => {
  const params = await props.params;
  const contest = await getContest(params.slug);

  if (!contest) {
    notFound();
  }

  return <ContestDetailClient initialContest={contest} slug={params.slug} />;
};

export default ContestDetailPage;
