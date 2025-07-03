"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const CallToActionSection = () => {
  return (
    <div className="relative py-16 sm:py-24 bg-white">
      <Image
        src="/landing-call-to-action.jpg"
        alt="Rentiful Search Section Background"
        fill
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/60"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-12"
      >
        <div className="flex flex-col justify-center items-center text-center gap-4 sm:gap-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Find Your Dream Rental Property
          </h2>
          <p className="text-white text-base sm:text-lg">
            Discover a wide range of rental properties in your desired location.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full max-w-xs sm:max-w-none">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block text-black bg-white rounded-lg px-6 py-3 font-semibold hover:bg-black hover:text-white transition"
            >
              Search
            </button>
            <Link
              href="/signup"
              className="inline-block text-white bg-red-400 rounded-lg px-6 py-3 font-semibold hover:bg-red-500 transition"
              scroll={false}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CallToActionSection;
