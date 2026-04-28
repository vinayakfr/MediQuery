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
        <div className="flex flex-col gap-4 mb-5">
          <p className="text-gray-700 font-mono">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit
            dicta enim facere, deleniti consectetur ipsa possimus minima beatae
            cum illo? Temporibus esse laudantium omnis pariatur nam qui voluptas
            voluptates eos, quidem totam voluptatum adipisci, illum commodi
            eaque sapiente quae consequatur officiis? Ad, temporibus.
          </p>
          <p className="text-gray-700 font-mono">
            Nobis molestias aspernatur repellendus, necessitatibus earum sequi
            unde culpa consectetur quam ducimus blanditiis! Porro, aspernatur?
          </p>
          <p className="text-gray-700 font-mono">
            Eveniet nulla magni aliquam nesciunt ad veniam blanditiis beatae
            optio magnam error illo, voluptates aperiam fuga voluptatibus minus
            fugiat debitis odit sit sunt nobis quo libero. Minima nam obcaecati
            perspiciatis. Facere nostrum laborum ut, culpa architecto tenetur?
            Cumque provident magnam omnis sint.
          </p>
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
