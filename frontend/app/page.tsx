"use client";

import { NavRail } from "@/components/NavRail";
import { SubNav } from "@/components/SubNav";
import { MainArea } from "@/components/MainArea";

export default function Dashboard() {
  return (
    <div className="w-full h-full flex gap-4 xl:gap-8 rounded-4xl overflow-hidden glass-panel p-4 xl:p-6 shadow-2xl relative">
      <SubNav />
      <MainArea />
    </div>
  );
}
