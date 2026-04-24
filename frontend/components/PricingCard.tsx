"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

export interface PricingPlan {
  name: string;
  tagline: string;
  price: string;
  billing: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  gradient: string;       // tailwind gradient classes for the bottom band
  glowColor: string;      // hover glow color
  badgeText?: string;
}

export function PricingCard({
  plan,
  index,
}: {
  plan: PricingPlan;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      className="relative flex flex-col rounded-3xl overflow-hidden group cursor-pointer"
      style={{ minHeight: 450 }}
    >
      {/* ── Light upper body ── */}
      <div
        className='relative flex-1 flex-col gap-5 space-y-1 p-5 glass-panel shadow-md rounded-2xl'
      >
        {/* Hover glow */}
        <div
          className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-all duration-700 ${plan.glowColor}`}
        />

        {/* Badge */}
        {plan.badgeText && (
          <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full glass-panel-dark-dark text-white/70 border border-white/10">
            {plan.badgeText}
          </span>
        )}

        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-gray-600 tracking-tight">
            {plan.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{plan.tagline}</p>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-3.5 mt-15">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/10">
                <Check size={12} className="text-gray-700 bg-black/10 rounded" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="absolute bottom-1 right-0 mt-auto w-full items-end justify-between glass-panel-dark-dark shadow-md px-3 rounded-2xl">
          <div className="py-1">
            <span className="text-4xl font-light text-white tracking-tight">
              {plan.price}
            </span>
            <p className="text-xs text-gray-500 mt-1">{plan.billing}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
