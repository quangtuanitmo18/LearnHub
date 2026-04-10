import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CertificateService } from '@/services/certificates';
import { ICertificate } from '@/types/certificate';
import { toast } from 'sonner';

export const certificateKeys = {
  all: ['certificates'] as const,
  mine: () => [...certificateKeys.all, 'mine'] as const,
  verify: (id: string) => [...certificateKeys.all, 'verify', id] as const,
};

export function useMyCertificates() {
  return useQuery({
    queryKey: certificateKeys.mine(),
    queryFn: (): Promise<ICertificate[]> => CertificateService.getMyCertificates(),
  });
}

export function useClaimCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => CertificateService.claim(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: certificateKeys.mine(),
      });
      toast.success('Certificate claimed successfully! View it in your dashboard.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to claim certificate');
    },
  });
}

export function useVerifyCertificate(verifyId: string) {
  return useQuery({
    queryKey: certificateKeys.verify(verifyId),
    queryFn: (): Promise<ICertificate> => CertificateService.verify(verifyId),
    enabled: !!verifyId,
  });
}
