"use client";

import { useState } from "react";
import { User, Bell, Key, Save } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { motion } from "framer-motion";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("Profile");
    const tabs = ["Profile", "Preferences", "API Keys"];

    return (
        <div className="flex-1 h-full flex flex-col pr-2 pb-2 min-h-0">
            <div className="flex justify-between items-start pt-2 pb-6">
                <div>
                    <h1 className="text-3xl font-light text-gray-800 tracking-tight">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your preferences and configurations
                    </p>
                </div>
                <ActionButton text={"Save Changes"} onClick={() => console.log("Saved")} />
            </div>

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
                                    layoutId="activeTabSettings"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 glass-panel rounded-3xl p-6 min-h-0 overflow-y-auto panel-scrollbar">
                    {activeTab === "Profile" && (
                        <div className="flex flex-col gap-6 max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Profile Information</h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" defaultValue="Dr. Sarah Connor" className="glass-panel-dark h-12 rounded-xl px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-400/50" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <input type="email" defaultValue="sarah.connor@hospital.org" className="glass-panel-dark h-12 rounded-xl px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-400/50" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Role / Specialization</label>
                                    <input type="text" defaultValue="Chief Cardiologist" disabled className="glass-panel-dark h-12 rounded-xl px-4 text-sm text-gray-500 cursor-not-allowed opacity-70" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "Preferences" && (
                        <div className="flex flex-col gap-6 max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">System Preferences</h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 glass-panel-dark rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-800">Email Notifications</span>
                                        <span className="text-xs text-gray-500">Receive alerts for new analysis results</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 glass-panel-dark rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-800">Dark Mode</span>
                                        <span className="text-xs text-gray-500">Toggle dark mode interface</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "API Keys" && (
                        <div className="flex flex-col gap-6 max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Agentic Pipeline Keys</h2>
                            <p className="text-sm text-gray-500 -mt-4 mb-2">Connect your preferred LLM providers to power the medical analysis agent.</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">OpenAI API Key</label>
                                    <input type="password" placeholder="sk-..." className="glass-panel-dark h-12 rounded-xl px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-400/50" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Anthropic API Key</label>
                                    <input type="password" placeholder="sk-ant-..." className="glass-panel-dark h-12 rounded-xl px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-400/50" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
