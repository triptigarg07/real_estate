import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const FooterSection = () => {
  return (
    <footer className="border-t border-gray-200 py-20">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <div className="mb-6">
          <Link href="/" className="text-2xl font-bold" scroll={false}>
            RENTIFUL
          </Link>
        </div>

        <nav className="mb-6">
          <ul className="flex justify-center flex-wrap gap-6 text-sm">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
          </ul>
        </nav>

        <div className="flex justify-center space-x-6">
          <a href="#" aria-label="Facebook" className="hover:text-black">
            <FontAwesomeIcon icon={faFacebook} className="h-6 w-6" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-black">
            <FontAwesomeIcon icon={faInstagram} className="h-6 w-6" />
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-black">
            <FontAwesomeIcon icon={faTwitter} className="h-6 w-6" />
          </a>
          <a href="#" aria-label="Linkedin" className="hover:text-black">
            <FontAwesomeIcon icon={faLinkedin} className="h-6 w-6" />
          </a>
          <a href="#" aria-label="Youtube" className="hover:text-black">
            <FontAwesomeIcon icon={faYoutube} className="h-6 w-6" />
          </a>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 flex justify-center space-x-4">
          <span>© RENTiful. All rights reserved.</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
