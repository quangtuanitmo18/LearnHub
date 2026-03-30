'use client';

import {
  MembershipBadge,
  MembershipComparison,
  MembershipIcon,
  MembershipPlan,
  MembershipPlans,
} from '@/components/membership';

export default function MembershipPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-16 text-white sm:py-24">
        <div className="container mx-auto px-4 text-center sm:px-6">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
            Membership{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Tiers
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-purple-200">
            Choose the perfect membership plan for your learning journey. Upgrade anytime as you
            grow.
          </p>

          {/* Badge Showcase */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <MembershipBadge plan={MembershipPlan.COPPER} size="lg" />
            <MembershipBadge plan={MembershipPlan.SILVER} size="lg" />
            <MembershipBadge plan={MembershipPlan.GOLD} size="lg" />
            <MembershipBadge plan={MembershipPlan.DIAMOND} size="lg" />
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <MembershipPlans
        onSelectPlan={(plan) => {
          console.log(`Selected plan: ${plan}`);
        }}
      />

      {/* Comparison Table */}
      <MembershipComparison
        onSelectPlan={(plan) => {
          console.log(`Selected plan from comparison: ${plan}`);
        }}
      />

      {/* Badge Variants Demo */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">Badge & Icon Variants</h2>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* Sizes */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Badge Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Small</p>
                  <MembershipBadge plan={MembershipPlan.GOLD} size="sm" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Medium (Default)</p>
                  <MembershipBadge plan={MembershipPlan.GOLD} size="md" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Large</p>
                  <MembershipBadge plan={MembershipPlan.GOLD} size="lg" />
                </div>
              </div>
            </div>

            {/* Icons Only */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Icon Only</h3>
              <div className="flex flex-wrap items-center gap-4">
                <MembershipIcon plan={MembershipPlan.COPPER} size="sm" />
                <MembershipIcon plan={MembershipPlan.SILVER} size="md" />
                <MembershipIcon plan={MembershipPlan.GOLD} size="lg" />
                <MembershipIcon plan={MembershipPlan.DIAMOND} size="lg" />
              </div>
            </div>

            {/* All Tiers */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">All Membership Tiers</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.values(MembershipPlan).map((plan) => (
                  <div
                    key={plan}
                    className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4"
                  >
                    <MembershipIcon plan={plan} size="lg" />
                    <MembershipBadge plan={plan} showLabel />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
