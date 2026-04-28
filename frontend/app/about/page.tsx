import FeatureCard from "@/components/FeatureCard";
import { Heart, Zap, Target, Users, BotIcon, Network } from "lucide-react";

export default function Page() {
  return (
    <div className="flex-1 h-full flex flex-col pr-2 pb-2">
      {/* Header */}
      <div className="flex justify-between items-start pt-2 pb-6">
        <div>
          <h1 className="text-3xl font-light text-gray-800 tracking-tight">
            About Us
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Learn more about our mission and values
          </p>
        </div>
      </div>
      <div className="flex-1 glass-panel rounded-3xl p-6 relative overflow-y-scroll group">
        <div className="flex flex-col gap-6 mb-8 max-w-4xl">
          <div className="glass-panel-dark p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We are committed to revolutionizing healthcare through the power of multi-agent artificial intelligence. Our platform streamlines medical data processing by autonomously extracting insights, predicting condition urgency, and routing critical information to the right specialists in real-time. By augmenting the capabilities of medical professionals, we strive to reduce diagnostic errors and improve patient outcomes globally.
            </p>
          </div>
          
          <div className="glass-panel-dark p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Our Vision
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We envision a future where every clinical decision is supported by a localized, privacy-preserving network of AI agents. A world where vast medical histories are synthesized in seconds, giving doctors back the time they need to focus on what truly matters: human connection and compassionate care.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 h-[55%] gap-5 mb-5">
          <FeatureCard
            title={"Agentic AI"}
            description={"Agentic AI for intelligent and autonomous solutions."}
            icon={BotIcon}
          />
          <FeatureCard
            title={"Multi-Modal Network"}
            description={"A network of models performing together"}
            icon={Network}
          />
          <FeatureCard
            title={"Personalised Recommendations"}
            description={"Guidance tailored to your health"}
            icon={Zap}
          />
          <FeatureCard
            title={"Community-Driven"}
            description={
              "Built by a passionate community of developers and users."
            }
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
}
