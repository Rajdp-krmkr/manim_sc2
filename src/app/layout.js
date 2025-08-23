import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GenerationProvider } from "@/context/GenerationContext";
import { QueryProvider } from "@/providers/query-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "manimate - Mathematical Animation Studio",
  description: "Create stunning mathematical animations with AI-powered tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} transition-all duration-300 bg-black text-white`}
      >
        <QueryProvider>
          <AuthProvider>
            <GenerationProvider>{children}</GenerationProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
