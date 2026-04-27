"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ActionButton";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("Chat");
    const tabs = ["Chat", "Raw Data"];

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [rawData, setRawData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    type Condition = {
        name: string;
        confidence: string;
        reason: string;
    };

    type AgentAnalysis = {
        summary: string;
        symptoms: string[];
        possible_conditions: Condition[];
        urgency: "low" | "medium" | "high";
        recommendation: string;
    };

    type Message = {
        role: "user" | "ai";
        content: string;
        data?: AgentAnalysis;
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input;

        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/analyse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: userMessage }),
            });

            const data = await res.json();

            setRawData(data);

            // ✅ Correct extraction
            if (data?.agent_analysis?.error) {
                throw new Error("Invalid agent output");
            }

            const summary = data?.agent_analysis?.summary || "No summary available";
            const urgency = data?.agent_analysis?.urgency || "";

            const aiReply = `${summary}\n\nUrgency: ${urgency.toUpperCase()}`;

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: aiReply,
                    data: data.agent_analysis,
                },
            ]);

        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { role: "ai", content: "Server error. Try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 h-full flex flex-col pr-2 pb-2">
            {/* Header */}
            <div className="flex justify-between items-start pt-2 pb-6">
                <div>
                    <h1 className="text-3xl font-light text-gray-800 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        All Your Patient Workflows And Permissions
                    </p>
                </div>
            </div>

            {/* Tabs section */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex gap-6 mb-6 border-b border-gray-300/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-sm font-medium transition-colors relative
                      ${activeTab === tab ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}
                    `}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Pane showing AI JSON result placeholder */}
                <div className="flex-1 glass-panel rounded-3xl p-6 relative overflow-hidden group">

                    {activeTab === "Raw Data" && (
                        <div className="h-full flex flex-col w-full">
                            <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">
                                Raw JSON Data
                            </h3>
                            <div className="bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-md shadow-sm h-full font-mono text-sm text-gray-800 overflow-auto panel-scrollbar">
                                <pre className="whitespace-pre-wrap">
                                    {rawData ? JSON.stringify(rawData, null, 2) : "No data yet"}
                                </pre>
                            </div>
                        </div>
                    )}
                    {activeTab === "Chat" && (
                        <div className="w-full h-full flex flex-col gap-2 items-start justify-start text-gray-400 font-light">
                            <div className="flex gap-2 w-full items-center justify-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    className="w-full glass-panel h-14 rounded-2xl px-4 text-gray-800 font-medium"
                                    placeholder="Ask something..."
                                />
                                <ActionButton text="Send" onClick={sendMessage} />
                            </div>

                            <div className="flex-1 glass-panel w-full h-full p-4 rounded-2xl overflow-auto">
                                <div className="flex flex-col gap-3">

                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`max-w-[70%] px-4 py-3 rounded-xl text-sm ${msg.role === "user"
                                                ? "self-end bg-gray-800 text-white"
                                                : "self-start bg-white/60 text-gray-800"
                                                }`}
                                        >
                                            {msg.role === "ai" && msg.data ? (
                                                <div className="flex flex-col gap-3">

                                                    {/* SUMMARY */}
                                                    <div className="font-semibold text-gray-900">
                                                        {msg.data.summary}
                                                    </div>

                                                    {/* URGENCY */}
                                                    <div className="text-xs">
                                                        Urgency:
                                                        <span
                                                            className={`ml-2 font-semibold ${msg.data.urgency === "high"
                                                                ? "text-red-500"
                                                                : msg.data.urgency === "medium"
                                                                    ? "text-yellow-500"
                                                                    : "text-green-500"
                                                                }`}
                                                        >
                                                            {msg.data.urgency?.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    {/* CONDITIONS */}
                                                    <div className="flex flex-col gap-2">
                                                        {msg.data.possible_conditions?.map((cond, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="p-2 rounded-lg bg-white/80 border border-gray-200"
                                                            >
                                                                <div className="font-medium">{cond.name}</div>
                                                                <div className="text-xs text-gray-600">
                                                                    {cond.reason}
                                                                </div>
                                                                <div className="text-xs font-semibold">
                                                                    Confidence: {cond.confidence}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* RECOMMENDATION */}
                                                    <div className="text-xs text-gray-700 italic">
                                                        {msg.data.recommendation}
                                                    </div>

                                                </div>
                                            ) : (
                                                <span>{msg.content}</span>
                                            )}
                                        </div>
                                    ))}

                                    {loading && (
                                        <div className="text-xs text-gray-500 animate-pulse">
                                            Thinking...
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}