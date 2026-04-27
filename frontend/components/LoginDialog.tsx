"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginDialog() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    return (
        <div className="glass-panel rounded-3xl p-10 w-full max-w-sm flex flex-col gap-6">

            <div>
                <h1 className="text-2xl font-light text-gray-800 tracking-tight">Welcome back</h1>
                <p className="text-sm text-gray-500 mt-1">Sign in to your patient dashboard</p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@hospital.com"
                        className="glass-panel h-11 rounded-2xl px-4 text-sm text-gray-800 placeholder:text-gray-400"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
                        <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Forgot password?</a>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="glass-panel h-11 rounded-2xl px-4 text-sm text-gray-800 placeholder:text-gray-400"
                    />
                </div>
            </div>

            <button
                onClick={() => router.push("/dashboard")}
                className="w-full h-12 bg-gray-900 text-white text-sm font-medium rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
                Sign in
            </button>

            <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex-1 h-px bg-black/10" />
                or
                <div className="flex-1 h-px bg-black/10" />
            </div>

            <button className="w-full h-11 glass-panel rounded-2xl text-sm text-gray-500 hover:bg-white/60 transition-all">
                Continue with SSO / hospital credentials
            </button>

            <p className="text-center text-xs text-gray-400">
                Don't have an account?{" "}
                <a href="/pricing" className="text-gray-600 font-medium hover:text-gray-900 transition-colors">View plans</a>
            </p>
        </div>
    );
}