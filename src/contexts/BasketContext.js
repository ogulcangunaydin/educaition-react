import React, { createContext, useContext, useState } from "react";

const BasketContext = createContext();

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
};

export const BasketProvider = ({ children }) => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);

  const addProgram = (program) => {
    setSelectedPrograms((prev) => {
      // Avoid duplicates
      if (prev.some((p) => p.yop_kodu === program.yop_kodu)) {
        return prev;
      }
      return [...prev, program];
    });
  };

  const removeProgram = (yop_kodu) => {
    setSelectedPrograms((prev) => prev.filter((p) => p.yop_kodu !== yop_kodu));
  };

  const toggleProgram = (program) => {
    setSelectedPrograms((prev) => {
      const exists = prev.some((p) => p.yop_kodu === program.yop_kodu);
      if (exists) {
        return prev.filter((p) => p.yop_kodu !== program.yop_kodu);
      }
      return [...prev, program];
    });
  };

  const clearBasket = () => {
    setSelectedPrograms([]);
  };

  const isSelected = (yop_kodu) => {
    return selectedPrograms.some((p) => p.yop_kodu === yop_kodu);
  };

  return (
    <BasketContext.Provider
      value={{
        selectedPrograms,
        addProgram,
        removeProgram,
        toggleProgram,
        clearBasket,
        isSelected,
        count: selectedPrograms.length,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};
