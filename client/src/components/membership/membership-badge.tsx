"use client";

import { cn } from "@/lib/utils";
import { Crown, Diamond, Medal, Star, Sparkles } from "lucide-react";
import { MembershipPlan } from "./membership-plans";

interface MembershipBadgeProps {
  plan: MembershipPlan;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const planConfig = {
  [MembershipPlan.COPPER]: {
    icon: Medal,
    label: "Copper",
    gradient: "from-amber-600 via-orange-500 to-amber-700",
    bgGradient: "from-amber-100 to-orange-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
    glowColor: "shadow-amber-200/50",
  },
  [MembershipPlan.SILVER]: {
    icon: Star,
    label: "Silver",
    gradient: "from-slate-400 via-gray-300 to-slate-500",
    bgGradient: "from-slate-100 to-gray-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
    glowColor: "shadow-slate-200/50",
  },
  [MembershipPlan.GOLD]: {
    icon: Crown,
    label: "Gold",
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    bgGradient: "from-yellow-100 to-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-yellow-400",
    glowColor: "shadow-yellow-300/50",
  },
  [MembershipPlan.DIAMOND]: {
    icon: Diamond,
    label: "Diamond",
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    bgGradient: "from-cyan-100 via-blue-100 to-purple-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    glowColor: "shadow-blue-200/50",
  },
};

const sizeConfig = {
  sm: {
    container: "px-2 py-1 gap-1.5",
    icon: "h-3 w-3",
    text: "text-xs",
    iconWrapper: "w-5 h-5",
  },
  md: {
    container: "px-3 py-1.5 gap-2",
    icon: "h-4 w-4",
    text: "text-sm",
    iconWrapper: "w-6 h-6",
  },
  lg: {
    container: "px-4 py-2 gap-2.5",
    icon: "h-5 w-5",
    text: "text-base",
    iconWrapper: "w-8 h-8",
  },
};

export function MembershipBadge({
  plan,
  size = "md",
  showLabel = true,
  animated = true,
  className,
}: MembershipBadgeProps) {
  const config = planConfig[plan];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-all duration-300",
        `bg-gradient-to-r ${config.bgGradient}`,
        config.borderColor,
        animated && `hover:shadow-lg ${config.glowColor}`,
        sizes.container,
        className
      )}
    >
      {/* Icon with gradient background */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br",
          config.gradient,
          sizes.iconWrapper,
          animated && "group-hover:scale-110 transition-transform duration-300"
        )}
      >
        <Icon className={cn("text-white", sizes.icon)} />
      </div>

      {/* Label */}
      {showLabel && (
        <span className={cn("font-semibold", config.textColor, sizes.text)}>
          {config.label}
        </span>
      )}

      {/* Sparkle for premium tiers */}
      {(plan === MembershipPlan.GOLD || plan === MembershipPlan.DIAMOND) &&
        animated && (
          <Sparkles
            className={cn(
              "text-yellow-500 animate-pulse",
              size === "sm"
                ? "h-2.5 w-2.5"
                : size === "md"
                ? "h-3 w-3"
                : "h-4 w-4"
            )}
          />
        )}
    </div>
  );
}

// Icon-only variant for avatars
interface MembershipIconProps {
  plan: MembershipPlan;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MembershipIcon({
  plan,
  size = "md",
  className,
}: MembershipIconProps) {
  const config = planConfig[plan];
  const Icon = config.icon;

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const innerIconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br shadow-md",
        config.gradient,
        iconSizes[size],
        className
      )}
    >
      <Icon className={cn("text-white", innerIconSizes[size])} />
    </div>
  );
}

export default MembershipBadge;
