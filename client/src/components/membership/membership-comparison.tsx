"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check,
  Crown,
  Diamond,
  Medal,
  Minus,
  Star,
  Sparkles,
} from "lucide-react";
import { MembershipPlan } from "./membership-plans";

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
    category: "Course Access",
    features: [
      {
        name: "Basic courses",
        copper: true,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: "Intermediate courses",
        copper: false,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: "Advanced courses",
        copper: false,
        silver: false,
        gold: true,
        diamond: true,
      },
      {
        name: "Exclusive masterclasses",
        copper: false,
        silver: false,
        gold: false,
        diamond: true,
      },
      {
        name: "Course downloads",
        copper: "5/month",
        silver: "20/month",
        gold: "Unlimited",
        diamond: "Unlimited",
      },
    ],
  },
  {
    category: "Learning Resources",
    features: [
      {
        name: "Practice exercises",
        copper: true,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: "Project files",
        copper: false,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: "AI-powered learning assistant",
        copper: false,
        silver: false,
        gold: true,
        diamond: true,
      },
      {
        name: "Personalized learning path",
        copper: false,
        silver: false,
        gold: false,
        diamond: true,
      },
    ],
  },
  {
    category: "Community & Support",
    features: [
      {
        name: "Community forum",
        copper: true,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: "Live Q&A sessions",
        copper: false,
        silver: "Monthly",
        gold: "Weekly",
        diamond: "Daily",
      },
      {
        name: "1-on-1 mentoring",
        copper: false,
        silver: false,
        gold: "2hrs/month",
        diamond: "Unlimited",
      },
      {
        name: "Career coaching",
        copper: false,
        silver: false,
        gold: false,
        diamond: true,
      },
      {
        name: "Support response time",
        copper: "48hrs",
        silver: "24hrs",
        gold: "4hrs",
        diamond: "Instant",
      },
    ],
  },
  {
    category: "Certifications",
    features: [
      {
        name: "Course certificates",
        copper: "Basic",
        silver: "Professional",
        gold: "Premium",
        diamond: "Verified",
      },
      {
        name: "LinkedIn integration",
        copper: false,
        silver: true,
        gold: true,
        diamond: true,
      },
      {
        name: "Verified badge",
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
    name: "Copper",
    icon: Medal,
    gradient: "from-amber-600 to-orange-500",
    price: "$9.99",
  },
  {
    id: MembershipPlan.SILVER,
    name: "Silver",
    icon: Star,
    gradient: "from-slate-400 to-gray-500",
    price: "$19.99",
  },
  {
    id: MembershipPlan.GOLD,
    name: "Gold",
    icon: Crown,
    gradient: "from-yellow-400 to-amber-500",
    price: "$39.99",
    popular: true,
  },
  {
    id: MembershipPlan.DIAMOND,
    name: "Diamond",
    icon: Diamond,
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    price: "$79.99",
  },
];

interface MembershipComparisonProps {
  onSelectPlan?: (plan: MembershipPlan) => void;
  currentPlan?: MembershipPlan;
}

export function MembershipComparison({
  onSelectPlan,
  currentPlan,
}: MembershipComparisonProps) {
  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <Minus className="h-5 w-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-purple-700 font-medium">Compare Plans</span>
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Feature{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Comparison
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect plan that matches your learning goals and needs.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 mb-6 sticky top-0 bg-white/80 backdrop-blur-sm py-4 rounded-xl z-10">
              <div className="flex items-end">
                <span className="text-sm font-medium text-gray-500">
                  Features
                </span>
              </div>
              {planHeaders.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "text-center p-4 rounded-xl transition-all duration-300",
                      plan.popular
                        ? "bg-gradient-to-b from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-lg"
                        : "bg-gray-50 border border-gray-200"
                    )}
                  >
                    {plan.popular && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs mb-2">
                        Most Popular
                      </Badge>
                    )}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br",
                        plan.gradient
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {plan.price}
                      <span className="text-sm font-normal text-gray-500">
                        /mo
                      </span>
                    </p>
                    <Button
                      size="sm"
                      onClick={() => onSelectPlan?.(plan.id)}
                      disabled={isCurrentPlan}
                      className={cn(
                        "w-full",
                        plan.popular || plan.id === MembershipPlan.DIAMOND
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90`
                          : ""
                      )}
                      variant={
                        plan.popular || plan.id === MembershipPlan.DIAMOND
                          ? "default"
                          : "outline"
                      }
                    >
                      {isCurrentPlan ? "Current" : "Select"}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Table Body */}
            {comparisonData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                {/* Category Header */}
                <div className="grid grid-cols-5 gap-4 mb-2">
                  <div className="col-span-5">
                    <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wide bg-purple-50 px-4 py-2 rounded-lg">
                      {category.category}
                    </h4>
                  </div>
                </div>

                {/* Category Features */}
                {category.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className={cn(
                      "grid grid-cols-5 gap-4 py-3 px-4 rounded-lg transition-colors",
                      featureIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                      "hover:bg-blue-50/50"
                    )}
                  >
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">
                        {feature.name}
                      </span>
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
