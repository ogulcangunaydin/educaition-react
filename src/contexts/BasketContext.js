import React, { createContext, useContext, useState, useEffect } from "react";

const BasketContext = createContext();

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
};

export const BasketProvider = ({ children }) => {
  // Initialize from localStorage
  const [selectedPrograms, setSelectedPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedPrograms");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading selectedPrograms from localStorage:", error);
      return [];
    }
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedYear");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error loading selectedYear from localStorage:", error);
      return null;
    }
  });

  // Save to localStorage whenever selectedPrograms changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "selectedPrograms",
        JSON.stringify(selectedPrograms)
      );
    } catch (error) {
      console.error("Error saving selectedPrograms to localStorage:", error);
    }
  }, [selectedPrograms]);

  // Save to localStorage whenever selectedYear changes
  useEffect(() => {
    try {
      localStorage.setItem("selectedYear", JSON.stringify(selectedYear));
    } catch (error) {
      console.error("Error saving selectedYear to localStorage:", error);
    }
  }, [selectedYear]);

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
    localStorage.removeItem("selectedPrograms");
  };

  const isSelected = (yop_kodu) => {
    return selectedPrograms.some((p) => p.yop_kodu === yop_kodu);
  };

  return (
    <BasketContext.Provider
      value={{
        selectedPrograms,
        selectedYear,
        setYear: setSelectedYear,
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
