import React from "react";
import { CgMail, CgFileDocument, CgCodeSlash } from "react-icons/cg";

const Footer = () => {
  return (
    <footer id="contact" className="bg-black border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">manimate</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Transform your mathematical concepts into stunning visual
              animations with the power of natural language prompts.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <CgMail className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <CgFileDocument className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <CgCodeSlash className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["Home", "Features", "Examples", "About", "Documentation"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                "API Reference",
                "Tutorials",
                "Community",
                "Support",
                "GitHub",
              ].map((resource) => (
                <li key={resource}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 manimate Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
