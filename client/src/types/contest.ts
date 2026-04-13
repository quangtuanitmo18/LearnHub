export enum ContestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageId?: string | null;
  passScore?: number | null;
  maxAttempts?: number | null;
  durationSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  showResultDate?: string | null;
  isMembership: boolean;
  status: ContestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContestRequest {
  title: string;
  description?: string;
  imageId?: string;
  passScore?: number;
  maxAttempts?: number;
  durationSec?: number;
  startTime?: string;
  endTime?: string;
  showResultDate?: string;
  isMembership?: boolean;
}

export interface UpdateContestRequest extends Partial<CreateContestRequest> {
  status?: ContestStatus;
}
