import { LucideIcon } from "lucide-react";

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className='glass-panel-dark flex flex-col justify-between rounded-xl p-5'>
            <div className="flex flex-col gap-2">

                <h1 className="text-black text-2xl font-medium">{title}</h1>
                <p className="text-gray-700 text-sm font-light">{description}</p>
            </div>
            {Icon && (
                <div className='flex justify-end w-full'>
                    <div className='border border-black/20 rounded-lg p-2'>
                        <Icon size={25} color="black" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default FeatureCard
