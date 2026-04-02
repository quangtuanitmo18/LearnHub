'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Crown, Diamond, Medal, Sparkles, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCreateMembershipOrder } from '@/hooks/use-membership';
import { useCreateStripeCheckout } from '@/hooks/use-payment';
import { PaymentMethod } from '@/types/order';
import { MembershipPlan } from '@/types/membership';
import { formatPrice } from '@/utils/format';

// Re-export MembershipPlan for backwards compatibility
export { MembershipPlan };

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface MembershipPlanData {
  id: MembershipPlan;
  name: string;
  description: string;
  price: number;
  duration: number; // duration in months
  icon: React.ElementType;
  features: PlanFeature[];
  popular?: boolean;
  gradient: string;
  iconGradient: string;
  borderColor: string;
  badgeColor: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
  glowColor: string;
  savingsPercent?: number;
}

const membershipPlans: MembershipPlanData[] = [
  {
    id: MembershipPlan.COPPER,
    name: 'Copper',
    description: 'Perfect for beginners starting their learning journey',
    price: 9.99,
    duration: 1,
    icon: Medal,
    gradient: 'from-amber-600 via-orange-500 to-amber-700',
    iconGradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-200 hover:border-amber-300',
    badgeColor: 'bg-amber-100 text-amber-700',
    buttonVariant: 'outline',
    glowColor: 'group-hover:shadow-amber-200/50',
    features: [
      { text: 'Access to 50+ basic courses', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Basic certificates', included: true },
      { text: 'Email support', included: true },
      { text: 'Live sessions', included: false },
      { text: '1-on-1 mentoring', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: MembershipPlan.SILVER,
    name: 'Silver',
    description: 'Ideal for dedicated learners seeking more content',
    price: 24.99,
    duration: 3,
    savingsPercent: 16,
    icon: Star,
    gradient: 'from-slate-400 via-gray-300 to-slate-500',
    iconGradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200 hover:border-slate-300',
    badgeColor: 'bg-slate-100 text-slate-700',
    buttonVariant: 'outline',
    glowColor: 'group-hover:shadow-slate-200/50',
    features: [
      { text: 'Access to 200+ courses', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Professional certificates', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Monthly live sessions', included: true },
      { text: '1-on-1 mentoring', included: false },
      { text: '24/7 priority support', included: false },
    ],
  },
  {
    id: MembershipPlan.GOLD,
    name: 'Gold',
    description: 'Best value for serious professionals and teams',
    price: 44.99,
    duration: 6,
    savingsPercent: 25,
    icon: Crown,
    popular: true,
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    iconGradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-300 hover:border-yellow-400',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
    buttonVariant: 'default',
    glowColor: 'group-hover:shadow-yellow-300/50',
    features: [
      { text: 'Access to ALL 500+ courses', included: true, highlight: true },
      { text: 'Exclusive community access', included: true },
      { text: 'Mobile & desktop apps', included: true },
      { text: 'Premium certificates', included: true, highlight: true },
      { text: 'Priority support', included: true },
      { text: 'Weekly live sessions', included: true },
      { text: 'Group mentoring sessions', included: true },
      { text: '24/7 priority support', included: false },
    ],
  },
  {
    id: MembershipPlan.DIAMOND,
    name: 'Diamond',
    description: 'Ultimate experience with exclusive perks and support',
    price: 79.99,
    duration: 12,
    savingsPercent: 33,
    icon: Diamond,
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    iconGradient: 'from-cyan-400 via-blue-500 to-purple-500',
    borderColor: 'border-blue-200 hover:border-purple-300',
    badgeColor: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white',
    buttonVariant: 'default',
    glowColor: 'group-hover:shadow-blue-300/50',
    features: [
      {
        text: 'Unlimited access to everything',
        included: true,
        highlight: true,
      },
      { text: 'VIP community & networking', included: true, highlight: true },
      { text: 'All platforms & devices', included: true },
      {
        text: 'Premium verified certificates',
        included: true,
        highlight: true,
      },
      { text: '1-on-1 expert mentoring', included: true, highlight: true },
      { text: 'Unlimited live sessions', included: true },
      { text: 'Career coaching', included: true },
      { text: '24/7 dedicated support', included: true },
    ],
  },
];

interface MembershipPlansProps {
  onSelectPlan?: (plan: MembershipPlan) => void;
  currentPlan?: MembershipPlan;
}

export function MembershipPlans({ onSelectPlan, currentPlan }: MembershipPlansProps) {
  const [processingPlan, setProcessingPlan] = useState<MembershipPlan | null>(null);
  const createMembershipOrder = useCreateMembershipOrder();
  const createStripeCheckout = useCreateStripeCheckout();

  const handleSelectPlan = (planId: MembershipPlan) => {
    // Call optional callback
    onSelectPlan?.(planId);

    // Start checkout process
    setProcessingPlan(planId);

    // Create membership order with Stripe payment method
    createMembershipOrder.mutate(
      {
        paymentMethod: PaymentMethod.STRIPE,
        plan: planId,
      },
      {
        onSuccess: (response) => {
          const orderCode = response?.code;
          if (!orderCode) {
            toast.error('Order code not found');
            setProcessingPlan(null);
            return;
          }

          // Create Stripe checkout session
          createStripeCheckout.mutate(
            { orderCode },
            {
              onSuccess: (stripeResponse) => {
                const sessionUrl = stripeResponse?.sessionUrl;
                if (sessionUrl) {
                  // Redirect to Stripe checkout
                  window.location.href = sessionUrl;
                } else {
                  toast.error('Failed to get checkout URL');
                  setProcessingPlan(null);
                }
              },
              onError: () => {
                setProcessingPlan(null);
              },
            },
          );
        },
        onError: () => {
          setProcessingPlan(null);
        },
      },
    );
  };



  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50" />
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 -z-10 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      {/* Animated floating elements */}
      <div className="animate-float-slow absolute top-20 left-10 opacity-20">
        <Sparkles className="h-8 w-8 text-purple-500" />
      </div>
      <div className="animate-float absolute top-40 right-20 opacity-20">
        <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
      </div>
      <div className="animate-float-slow absolute bottom-32 left-20 opacity-20">
        <Diamond className="h-7 w-7 text-blue-500" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center sm:mb-16">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center space-x-2 border-purple-200 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-700">Membership Plans</span>
          </Badge>

          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
            Unlock your potential with our flexible membership options. Start learning today and
            transform your career.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-4">
          {membershipPlans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  'group relative flex flex-col rounded-2xl border-2 bg-white transition-all duration-500 hover:scale-[1.02]',
                  plan.borderColor,
                  plan.glowColor,
                  'hover:shadow-2xl',
                  plan.popular && 'ring-2 ring-yellow-400 ring-offset-2',
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      <Zap className="h-3.5 w-3.5" fill="currentColor" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 z-10">
                    <div className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                      CURRENT
                    </div>
                  </div>
                )}

                {/* Card Header */}
                <div className="p-6 pb-0 sm:p-8">
                  {/* Icon with gradient background */}
                  <div
                    className={cn(
                      'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                      plan.gradient,
                    )}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Plan Name & Badge */}
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <Badge className={cn('text-xs font-semibold', plan.badgeColor)}>
                      {plan.id}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="mb-6 text-sm text-gray-600">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        {formatPrice(plan.price)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        {plan.duration}{' '}
                        {plan.duration === 1 ? 'month' : plan.duration === 12 ? 'year' : 'months'}
                      </p>
                      {plan.savingsPercent && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600">
                          Save ~{plan.savingsPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-6 border-t border-gray-100 sm:mx-8" />

                {/* Features */}
                <div className="flex-1 p-6 pt-6 sm:p-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className={cn(
                          'flex items-start gap-3 text-sm',
                          feature.included ? 'text-gray-700' : 'text-gray-400',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                            feature.included
                              ? feature.highlight
                                ? `bg-gradient-to-br ${plan.gradient}`
                                : 'bg-green-100'
                              : 'bg-gray-100',
                          )}
                        >
                          <Check
                            className={cn(
                              'h-3 w-3',
                              feature.included
                                ? feature.highlight
                                  ? 'text-white'
                                  : 'text-green-600'
                                : 'text-gray-400',
                            )}
                          />
                        </span>
                        <span className={feature.highlight ? 'font-medium' : ''}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="p-6 pt-0 sm:p-8">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || processingPlan === plan.id}
                    className={cn(
                      'h-12 w-full rounded-xl text-base font-semibold transition-all duration-300',
                      plan.popular || plan.id === MembershipPlan.DIAMOND
                        ? `bg-gradient-to-r ${plan.gradient} border-0 text-white shadow-lg hover:opacity-90 hover:shadow-xl`
                        : 'hover:bg-gray-100',
                    )}
                    variant={
                      plan.popular || plan.id === MembershipPlan.DIAMOND ? 'default' : 'outline'
                    }
                  >
                    {processingPlan === plan.id
                      ? 'Processing...'
                      : isCurrentPlan
                        ? 'Current Plan'
                        : 'Get Started'}
                  </Button>
                </div>

                {/* Animated border glow effect on hover */}
                <div
                  className={cn(
                    'absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100',
                    `bg-gradient-to-br ${plan.gradient}`,
                  )}
                  style={{ transform: 'scale(0.95)' }}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-sm text-gray-500">Trusted by 50,000+ learners worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">30-day money back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipPlans;
