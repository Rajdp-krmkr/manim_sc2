import React from "react";
import { CgMathPlus, CgDisplayGrid, CgFilm, CgCode } from "react-icons/cg";

const Features = () => {
  const features = [
    {
      icon: <CgMathPlus className="text-4xl text-yellow-300" />,
      title: "Mathematical Precision",
      description:
        "Create precise mathematical animations with LaTeX support and advanced equation rendering.",
    },
    {
      icon: <CgDisplayGrid className="text-4xl text-yellow-300" />,
      title: "Interactive Visualizations",
      description:
        "Generate dynamic graphs, plots, and interactive mathematical concepts with ease.",
    },
    {
      icon: <CgFilm className="text-4xl text-yellow-300" />,
      title: "High-Quality Videos",
      description:
        "Export professional-grade videos perfect for educational content and presentations.",
    },
    {
      icon: <CgCode className="text-4xl text-yellow-300" />,
      title: "Code to Animation",
      description:
        "Transform your mathematical concepts into stunning visual animations with simple prompts.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#0f0702] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-yellow-300 mb-4">
            Powerful Features
          </h2>
          <p className="text-yellow-500 text-lg max-w-2xl mx-auto">
            Discover the capabilities that make MathVision AI the perfect tool
            for creating mathematical animations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#170f02ce] backdrop-blur-sm p-6 rounded-xl border border-[#402a06] hover:border-[#523d05] transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-4 bg-[#2d1d04] rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  {feature.title}
                </h3>
                <p className="text-yellow-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
