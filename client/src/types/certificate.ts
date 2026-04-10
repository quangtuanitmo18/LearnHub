export interface ICertificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  pdfUrl?: string; // To be generated or handled in frontend
  course?: {
    title: string;
    slug: string;
    image: string;
    author: {
      username: string;
    };
  };
}

export interface ClaimCertificateRequest {
  courseId: string;
}

export interface MyCertificatesResponse {
  data: ICertificate[];
}
