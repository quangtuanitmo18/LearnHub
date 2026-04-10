export interface ICertificateCourse {
  title: string;
  slug: string;
  image?: {
    cdnBaseUrl: string;
    storageKey: string;
  } | null;
  author?: {
    username: string;
  };
}

export interface ICertificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  pdfUrl?: string | null;
  user?: {
    username: string;
    email: string;
  };
  course?: ICertificateCourse;
}

export interface ClaimCertificateRequest {
  courseId: string;
}

export interface MyCertificatesResponse {
  data: ICertificate[];
}
