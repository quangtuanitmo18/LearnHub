import { useMutation } from "@tanstack/react-query";
import { PaymentService } from "@/services/payment";
import type {
  CreateStripeCheckoutRequest,
  CreateStripeCheckoutResponse,
} from "@/services/payment";
import { toast } from "sonner";

// Hook to create Stripe checkout session
export function useCreateStripeCheckout() {
  return useMutation<
    CreateStripeCheckoutResponse,
    Error,
    CreateStripeCheckoutRequest
  >({
    mutationFn: (data: CreateStripeCheckoutRequest) =>
      PaymentService.createStripeCheckout(data),
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });
}
