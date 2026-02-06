"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        router.push("/dashboard");
      }
    };
    window.addEventListener("keydown", handler);
    return () =>
      window.removeEventListener("keydown", handler);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      
      <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Softa Tech
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Offline-First GST Billing System
        </p>

        <div className="h-px bg-gray-200 my-6" />

        <p className="text-gray-700 mb-8">
          System initialized successfully.
        </p>

        <Link
          href="/dashboard"
          className="block w-full bg-black text-white py-4 rounded-lg
            text-lg font-semibold hover:bg-gray-900 transition"
        >
          Go to Dashboard →
        </Link>

        <p className="text-xs text-gray-400 mt-6">
          Press <strong>Enter</strong> to continue
        </p>
      </div>
    </main>
  );
}
