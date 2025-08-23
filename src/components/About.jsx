import React from "react";
import { CgArrowRight } from "react-icons/cg";

const About = () => {
  return (
    <section id="about" className="py-20 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">
              About manimate
            </h2>
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                manimate is a powerful engine for creating precise
                mathematical animations. Originally created by Grant Sanderson
                (3Blue1Brown), it has become the go-to tool for educators,
                researchers, and content creators worldwide.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our platform makes manimate accessible to everyone through
                natural language prompts, eliminating the need to write complex
                code while maintaining the precision and beauty of mathematical
                visualizations.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-white font-semibold">
                    Python-Powered
                  </span>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-white font-semibold">
                    LaTeX Support
                  </span>
                </div>
                <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-white font-semibold">Open Source</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Why Choose Our Platform?
            </h3>
            <div className="space-y-4">
              {[
                "No coding experience required",
                "Instant preview of animations",
                "High-quality video exports",
                "Built-in mathematical libraries",
                "Community-driven examples",
                "Regular updates and improvements",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CgArrowRight className="text-white flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <button
                className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold"
                onClick={() => (window.location.href = "#")}
              >
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
