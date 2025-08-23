"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Examples = ({ setPrompt }) => {
  const router = useRouter();
  const examples = [
    {
      title: "Calculus Derivatives",
      prompt:
        "Show the derivative of x² as the limit of the difference quotient",
      description:
        "Visualize how derivatives work through animated limits and graphical representations.",
    },
    {
      title: "Linear Algebra",
      prompt:
        "Demonstrate matrix multiplication with 2x2 matrices using geometric transformations",
      description:
        "See how matrix operations transform geometric shapes in real-time.",
    },
    {
      title: "Trigonometry",
      prompt: "Animate the unit circle showing sine and cosine wave formation",
      description:
        "Connect circular motion to sinusoidal waves through smooth animations.",
    },
    {
      title: "Graph Theory",
      prompt:
        "Show Dijkstra's algorithm finding shortest path in a weighted graph",
      description:
        "Watch algorithms come to life with step-by-step visual execution.",
    },
    {
      title: "Physics Simulation",
      prompt:
        "Animate projectile motion with varying angles and initial velocities",
      description:
        "Combine mathematics with physics for realistic motion simulations.",
    },
    {
      title: "Complex Numbers",
      prompt: "Visualize complex number multiplication in the complex plane",
      description:
        "Make abstract mathematical concepts tangible through visual representation.",
    },
  ];

  return (
    <section id="examples" className="py-20 bg-[#170f02] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-yellow-300 mb-4">
            Example Animations
          </h2>
          <p className="text-yellow-500 text-lg max-w-2xl mx-auto">
            Get inspired by these examples of what you can create with simple
            text prompts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <div
              key={index}
              className="bg-[#170f02ce] backdrop-blur-sm p-6 rounded-xl border border-[#402a06] hover:border-[#523d05] transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  {example.title}
                </h3>
                <div className="bg-[#2d1d04] p-4 rounded-lg border border-[#402a06] mb-4">
                  <p className="text-[#c18e3d] text-sm italic">
                    &ldquo;{example.prompt}&rdquo;
                  </p>
                </div>
                <p className="text-yellow-400 text-sm leading-relaxed">
                  {example.description}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <button
                  className="bg-[#2d1d04] text-yellow-400 px-4 py-2 rounded-lg hover:bg-[#523d05] transition-all duration-300 text-sm"
                  onClick={() => {
                    router.push(
                      `/generate?prompt=${encodeURIComponent(example.prompt)}`
                    );
                  }}
                >
                  Try This Example
                </button>
                <div className="w-12 h-12 bg-[#2d1d04] rounded-lg border border-[#402a06] flex items-center justify-center">
                  <div className="w-6 h-6 bg-yellow-300 rounded opacity-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Examples;
