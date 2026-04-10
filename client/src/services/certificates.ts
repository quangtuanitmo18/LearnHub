import { ApiService } from '@/lib/api-service';
import { ICertificate } from '@/types/certificate';

const ENDPOINTS = {
  CLAIM: '/certificates/claim',
  MY_CERTIFICATES: '/certificates/my-certificates',
  VERIFY: (id: string) => `/certificates/verify/${id}`,
} as const;

export class CertificateService {
  static async claim(courseId: string): Promise<ICertificate> {
    return ApiService.post<ICertificate, { courseId: string }>(ENDPOINTS.CLAIM, { courseId });
  }

  static async getMyCertificates(): Promise<ICertificate[]> {
    return ApiService.get<ICertificate[]>(ENDPOINTS.MY_CERTIFICATES);
  }

  static async verify(id: string): Promise<ICertificate> {
    return ApiService.get<ICertificate>(ENDPOINTS.VERIFY(id));
  }
}

export default CertificateService;
