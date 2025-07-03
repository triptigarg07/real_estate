import React from "react";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import DiscoverSection from "./DiscoverSection";
import CallToActionSection from "./CallToActionSection";
import FooterSection from "./FooterSection";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Link from "next/link";

const Landing = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 mt-12">Welcome, {user.username || user.attributes?.email || "User"}!</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-md">You are signed in. Head to your dashboard to manage your properties or applications.</p>
        <Link href="/dashboard" className="inline-block bg-red-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500 transition text-base sm:text-lg">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <DiscoverSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  );
};

export default Landing;
