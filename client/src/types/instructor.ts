export interface InstructorProfile {
  id: string;
  userId: string;
  headline?: string | null;
  bio?: string | null;
  website?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IInstructor {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
  instructorProfile?: InstructorProfile | null;
  _count?: {
    courses: number;
  };
}

export interface IInstructorDetails extends IInstructor {
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    price: number | null;
    oldPrice: number | null;
    level: string;
    view: number;
    image: {
      storageKey: string;
      cdnBaseUrl: string;
      filename: string;
    } | null;
    _count: {
      lessons: number;
      reviews: number;
    };
    category: {
      name: string;
      slug: string;
    } | null;
  }>;
}

export interface InstructorsListResponse {
  message: string;
  data: IInstructor[];
}

export interface InstructorDetailResponse {
  message: string;
  data: IInstructorDetails;
}
