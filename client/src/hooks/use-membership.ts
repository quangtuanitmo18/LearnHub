import { useMutation } from "@tanstack/react-query";
import { MembershipService } from "@/services/membership";
import type {
  CreateMembershipOrderRequest,
  CreateMembershipOrderResponse,
} from "@/services/membership";
import { toast } from "sonner";

// Hook to create membership order
export function useCreateMembershipOrder() {
  return useMutation<
    CreateMembershipOrderResponse,
    Error,
    CreateMembershipOrderRequest
  >({
    mutationFn: (data: CreateMembershipOrderRequest) =>
      MembershipService.createMembershipOrder(data),
    onError: (error) => {
      toast.error(error.message || "Failed to create membership order");
    },
  });
}
