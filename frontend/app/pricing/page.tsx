"use client";

import { motion } from "framer-motion";
import { PricingCard, PricingPlan } from "@/components/PricingCard";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const plans: PricingPlan[] = [
    {
        name: "Starter",
        tagline: "For individual practitioners getting started",
        price: "$10",
        billing: "Billed monthly",
        features: [
            "50 patient analyses / month",
            "Basic symptom extraction",
            "Single user access",
            "Email support",
            "Standard response time",
        ],
        cta: "Choose Starter",
        gradient: "bg-gradient-to-r from-stone-300 via-amber-100 to-stone-200",
        glowColor: "bg-amber-400",
    },
    {
        name: "Professional",
        tagline: "Best for clinics and growing teams",
        price: "$50",
        billing: "Billed monthly",
        features: [
            "Unlimited patient analyses",
            "Advanced AI pipelines",
            "Up to 10 team members",
            "Priority support & SLA",
            "Custom workflow builder",
            "HIPAA-compliant storage",
        ],
        cta: "Choose Professional",
        highlighted: true,
        badgeText: "Most Popular",
        gradient: "bg-gradient-to-r from-emerald-200 via-green-100 to-teal-200",
        glowColor: "bg-green-400",
    },
    {
        name: "Enterprise",
        tagline: "For hospitals and large-scale deployments",
        price: "$250",
        billing: "Billed monthly",
        features: [
            "Everything in Professional",
            "Unlimited team members",
            "Dedicated account manager",
            "On-premise deployment",
            "Custom model fine-tuning",
            "24/7 phone support",
        ],
        cta: "Contact Sales",
        gradient: "bg-gradient-to-r from-purple-200 via-fuchsia-100 to-pink-200",
        glowColor: "bg-purple-400",
    },
];

export default function PricingPage() {
    return (
        <div className="w-full h-full flex flex-col glass-panel rounded-4xl p-6 xl:p-10 shadow-2xl overflow-y-auto panel-scrollbar">
            {/* Back link */}
            <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 w-fit"
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">
                    <Sparkles size={14} />
                    Pricing
                </div>
                <h1 className="text-4xl xl:text-5xl font-light text-gray-800 tracking-tight mb-3">
                    Choose your plan
                </h1>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Scale your medical AI workflows with a plan that fits your practice.
                    Upgrade or downgrade anytime.
                </p>
            </motion.div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
                {plans.map((plan, i) => (
                    <PricingCard key={plan.name} plan={plan} index={i} />
                ))}
            </div>

            {/* Footer note */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-xs text-gray-400 mt-10"
            >
                All plans include SSL encryption and GDPR compliance. No credit card
                required for Starter.
            </motion.p>
        </div>
    );
}
