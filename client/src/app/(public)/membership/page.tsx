import {
  MembershipBadge,
  MembershipComparison,
  MembershipIcon,
  MembershipPlan,
  MembershipPlans,
} from "@/components/membership";

export default function MembershipPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Membership{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500">
              Tiers
            </span>
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-8">
            Choose the perfect membership plan for your learning journey.
            Upgrade anytime as you grow.
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
        onSelectPlan={(plan, isYearly) => {
          console.log(`Selected plan: ${plan}, Yearly: ${isYearly}`);
        }}
      />

      {/* Comparison Table */}
      <MembershipComparison
        onSelectPlan={(plan) => {
          console.log(`Selected plan from comparison: ${plan}`);
        }}
      />

      {/* Badge Variants Demo */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center mb-8">
            Badge & Icon Variants
          </h2>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Sizes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Badge Sizes</h3>
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
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Icon Only</h3>
              <div className="flex flex-wrap items-center gap-4">
                <MembershipIcon plan={MembershipPlan.COPPER} size="sm" />
                <MembershipIcon plan={MembershipPlan.SILVER} size="md" />
                <MembershipIcon plan={MembershipPlan.GOLD} size="lg" />
                <MembershipIcon plan={MembershipPlan.DIAMOND} size="lg" />
              </div>
            </div>

            {/* All Tiers */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                All Membership Tiers
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(MembershipPlan).map((plan) => (
                  <div
                    key={plan}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50"
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
