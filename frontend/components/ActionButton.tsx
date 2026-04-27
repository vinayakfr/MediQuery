interface ActionButtonProps {
    text: string;
    onClick: () => void;
}

export function ActionButton({ text, onClick }: ActionButtonProps) {
    return (
        <button onClick={onClick} className="bg-black px-4 py-2 rounded-xl h-full cursor-pointer">
            <h1 className="text-white font-medium">{text}</h1>
        </button>
    )
}