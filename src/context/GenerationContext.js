"use client";
import React, { createContext, useContext, useState } from "react";

const GenerationContext = createContext();

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error("useGeneration must be used within a GenerationProvider");
  }
  return context;
};

export const GenerationProvider = ({ children }) => {
  const [generationData, setGenerationData] = useState(null);
  const [isLoadingGenerationData, setIsLoadingGenerationData] = useState(false);

  const setGenerationResponse = (data) => {
    setGenerationData(data);
  };

  const clearGenerationData = () => {
    setGenerationData(null);
  };

  const value = {
    generationData,
    isLoadingGenerationData,
    setIsLoadingGenerationData,
    setGenerationResponse,
    clearGenerationData,
  };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
};
