import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "MathVision AI - Mathematical Animation Studio",
  description: "Create stunning mathematical animations with AI-powered tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} transition-all duration-300 bg-black text-white`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        
      </body>
    </html>
  );
}
