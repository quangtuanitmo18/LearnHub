'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/format';
import { Check, Crown, Diamond, Medal, Minus, Star, Sparkles } from 'lucide-react';
import { MembershipPlan } from './membership-plans';

interface ComparisonFeature {
  category: string;
  features: {
    name: string;
    copper: boolean | string;
    silver: boolean | string;
    gold: boolean | string;
    diamond: boolean | string;
  }[];
}

const comparisonData: ComparisonFeature[] = [
  {
    category: 'Course Access',
    features: [
      {
        name: 'Basic courses',
        copper: true,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: 'Intermediate courses',
        copper: false,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: 'Advanced courses',
        copper: false,
        silver: false,
        gold: true,
        diamond: true,
      },
      {
        name: 'Exclusive masterclasses',
        copper: false,
        silver: false,
        gold: false,
        diamond: true,
      },
      {
        name: 'Course downloads',
        copper: '5/month',
        silver: '20/month',
        gold: 'Unlimited',
        diamond: 'Unlimited',
      },
    ],
  },
  {
    category: 'Learning Resources',
    features: [
      {
        name: 'Practice exercises',
        copper: true,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: 'Project files',
        copper: false,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: 'AI-powered learning assistant',
        copper: false,
        silver: false,
        gold: true,
        diamond: true,
      },
      {
        name: 'Personalized learning path',
        copper: false,
        silver: false,
        gold: false,
        diamond: true,
      },
    ],
  },
  {
    category: 'Community & Support',
    features: [
      {
        name: 'Community forum',
        copper: true,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: 'Live Q&A sessions',
        copper: false,
        silver: 'Monthly',
        gold: 'Weekly',
        diamond: 'Daily',
      },
      {
        name: '1-on-1 mentoring',
        copper: false,
        silver: false,
        gold: '2hrs/month',
        diamond: 'Unlimited',
      },
      {
        name: 'Career coaching',
        copper: false,
        silver: false,
        gold: false,
        diamond: true,
      },
      {
        name: 'Support response time',
        copper: '48hrs',
        silver: '24hrs',
        gold: '4hrs',
        diamond: 'Instant',
      },
    ],
  },
  {
    category: 'Certifications',
    features: [
      {
        name: 'Course certificates',
        copper: 'Basic',
        silver: 'Professional',
        gold: 'Premium',
        diamond: 'Verified',
      },
      {
        name: 'LinkedIn integration',
        copper: false,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: 'Verified badge',
        copper: false,
        silver: false,
        gold: false,
        diamond: true,
      },
    ],
  },
];

const planHeaders = [
  {
    id: MembershipPlan.COPPER,
    name: 'Copper',
    icon: Medal,
    gradient: 'from-amber-600 to-orange-500',
    price: 9.99,
    period: '1 month',
  },
  {
    id: MembershipPlan.SILVER,
    name: 'Silver',
    icon: Star,
    gradient: 'from-slate-400 to-gray-500',
    price: 24.99,
    period: '3 months',
  },
  {
    id: MembershipPlan.GOLD,
    name: 'Gold',
    icon: Crown,
    gradient: 'from-yellow-400 to-amber-500',
    price: 44.99,
    period: '6 months',
    popular: true,
  },
  {
    id: MembershipPlan.DIAMOND,
    name: 'Diamond',
    icon: Diamond,
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    price: 79.99,
    period: '12 months',
  },
];

interface MembershipComparisonProps {
  onSelectPlan?: (plan: MembershipPlan) => void;
  currentPlan?: MembershipPlan;
}

export function MembershipComparison({ onSelectPlan, currentPlan }: MembershipComparisonProps) {
  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="mx-auto h-5 w-5 text-green-500" />
      ) : (
        <Minus className="mx-auto h-5 w-5 text-gray-300" />
      );
    }
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center space-x-2 border-purple-200 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-700">Compare Plans</span>
          </Badge>

          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            Feature{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Comparison
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Find the perfect plan that matches your learning goals and needs.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mx-auto max-w-6xl overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="sticky top-0 z-10 mb-6 grid grid-cols-5 gap-4 rounded-xl bg-white/80 py-4 backdrop-blur-sm">
              <div className="flex items-end">
                <span className="text-sm font-medium text-gray-500">Features</span>
              </div>
              {planHeaders.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'rounded-xl p-4 text-center transition-all duration-300',
                      plan.popular
                        ? 'border-2 border-yellow-300 bg-gradient-to-b from-yellow-50 to-amber-50 shadow-lg'
                        : 'border border-gray-200 bg-gray-50',
                    )}
                  >
                    {plan.popular && (
                      <Badge className="mb-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-xs text-white">
                        Most Popular
                      </Badge>
                    )}
                    <div
                      className={cn(
                        'mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br',
                        plan.gradient,
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <p className="mb-2 text-xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </p>
                    <p className="mb-2 text-xs text-gray-500">{plan.period}</p>
                    <Button
                      size="sm"
                      onClick={() => onSelectPlan?.(plan.id)}
                      disabled={isCurrentPlan}
                      className={cn(
                        'w-full',
                        plan.popular || plan.id === MembershipPlan.DIAMOND
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90`
                          : '',
                      )}
                      variant={
                        plan.popular || plan.id === MembershipPlan.DIAMOND ? 'default' : 'outline'
                      }
                    >
                      {isCurrentPlan ? 'Current' : 'Select'}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Table Body */}
            {comparisonData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                {/* Category Header */}
                <div className="mb-2 grid grid-cols-5 gap-4">
                  <div className="col-span-5">
                    <h4 className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-bold tracking-wide text-purple-700 uppercase">
                      {category.category}
                    </h4>
                  </div>
                </div>

                {/* Category Features */}
                {category.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className={cn(
                      'grid grid-cols-5 gap-4 rounded-lg px-4 py-3 transition-colors',
                      featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                      'hover:bg-blue-50/50',
                    )}
                  >
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">{feature.name}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      {renderValue(feature.copper)}
                    </div>
                    <div className="flex items-center justify-center">
                      {renderValue(feature.silver)}
                    </div>
                    <div className="flex items-center justify-center">
                      {renderValue(feature.gold)}
                    </div>
                    <div className="flex items-center justify-center">
                      {renderValue(feature.diamond)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MembershipComparison;
