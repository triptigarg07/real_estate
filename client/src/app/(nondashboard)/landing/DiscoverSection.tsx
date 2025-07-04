"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const DiscoverSection = () => {
  return (
    <div className="py-12 bg-white mb-16">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="my-8 sm:my-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-gray-800">
              Discover
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Find your Dream Rental Property today!
            </p>
            <p className="mt-2 text-sm sm:text-lg text-gray-500 max-w-3xl mx-auto">
              Searching for your dream rental property has never been easier.
              With our user-friendly search feature, you can quickly find the
              perfect home that meets all your needs. Start your search today
              and discover your dream rental property!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
            {[
              {
                imageSrc: "/landing-icon-wand.png",
                title: "Search for Properties",
                description:
                  "Browse through our extensive collection of rental properties in your desired location.",
              },
              {
                imageSrc: "/landing-icon-calendar.png",
                title: "Book Your Rental",
                description:
                  "Once you have found the perfect rental property, easily book it online with just a few clicks.",
              },
              {
                imageSrc: "/landing-icon-heart.png",
                title: "Enjoy your New Home",
                description:
                  "Move into your new rental property and start enjoying your dream home.",
              },
            ].map((card, index) => (
              <motion.div key={index} variants={itemVariants}>
                <DiscoverCard {...card} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const DiscoverCard = ({
  imageSrc,
  title,
  description,
}: {
  imageSrc: string;
  title: string;
  description: string;
}) => (
  <div className="px-4 py-8 sm:py-12 shadow-lg rounded-lg bg-white md:h-72 text-center">
    <div className="bg-black p-[0.6rem] rounded-full mb-4 h-10 w-10 mx-auto">
      <Image
        src={imageSrc}
        width={30}
        height={30}
        className="w-full h-full"
        alt={title}
      />
    </div>
    <h3 className="mt-4 text-lg sm:text-xl font-medium text-gray-800">{title}</h3>
    <p className="mt-2 text-sm sm:text-base text-gray-500">{description}</p>
  </div>
);

export default DiscoverSection;
