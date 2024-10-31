import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Navbar } from "./(protected)/components/navbar";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <Navbar />
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl font-semibold drop-shadow-md",
            font.className
          )}
        >
          🔐 Auth
        </h1>
        <p className=" text-lg">A simple authentication service</p>
      </div>
    </main>
  );
}
