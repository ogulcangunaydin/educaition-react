import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserUniversity } from "../services/authService";

const UniversityContext = createContext();

// University configurations
export const UNIVERSITY_CONFIG = {
  halic: {
    id: "halic",
    name: "HALİÇ ÜNİVERSİTESİ",
    displayName: "Haliç Üniversitesi",
    logo: "/halic_universitesi_logo.svg",
    primaryColor: "#001bc3",
    gradientStart: "#001bc3",
    gradientEnd: "#0029e8",
    dataPrefix: "halic", // Used for loading data files like halic_programs.csv
  },
  ibnhaldun: {
    id: "ibnhaldun",
    name: "İBN HALDUN ÜNİVERSİTESİ",
    displayName: "İbn Haldun Üniversitesi",
    logo: "/halic_universitesi_logo.svg", // Always use Haliç logo
    primaryColor: "#001bc3",
    gradientStart: "#001bc3",
    gradientEnd: "#0029e8",
    dataPrefix: "ibnhaldun", // Used for loading data files like ibnhaldun_programs.csv
  },
  fsm: {
    id: "fsm",
    name: "FATİH SULTAN MEHMET VAKIF ÜNİVERSİTESİ",
    displayName: "Fatih Sultan Mehmet Vakıf Üniversitesi",
    logo: "/halic_universitesi_logo.svg", // Always use Haliç logo
    primaryColor: "#001bc3",
    gradientStart: "#001bc3",
    gradientEnd: "#0029e8",
    dataPrefix: "fsm", // Used for loading data files like fsm_programs.csv
  },
  izu: {
    id: "izu",
    name: "İSTANBUL SABAHATTİN ZAİM ÜNİVERSİTESİ",
    displayName: "İstanbul Sabahattin Zaim Üniversitesi",
    logo: "/halic_universitesi_logo.svg", // Always use Haliç logo
    primaryColor: "#001bc3",
    gradientStart: "#001bc3",
    gradientEnd: "#0029e8",
    dataPrefix: "izu", // Used for loading data files like izu_programs.csv
  },
  mayis: {
    id: "mayis",
    name: "İSTANBUL 29 MAYIS ÜNİVERSİTESİ",
    displayName: "İstanbul 29 Mayıs Üniversitesi",
    logo: "/halic_universitesi_logo.svg", // Always use Haliç logo
    primaryColor: "#001bc3",
    gradientStart: "#001bc3",
    gradientEnd: "#0029e8",
    dataPrefix: "mayis", // Used for loading data files like mayis_programs.csv
  },
};

export const useUniversity = () => {
  const context = useContext(UniversityContext);
  if (!context) {
    throw new Error("useUniversity must be used within a UniversityProvider");
  }
  return context;
};

export const UniversityProvider = ({ children }) => {
  const [universityKey, setUniversityKey] = useState(() => {
    try {
      // First try to get from localStorage (set by authService on login)
      const saved = localStorage.getItem("universityKey");
      // Also check the backend-provided university
      const backendUniversity = getUserUniversity();
      return backendUniversity || saved || "halic";
    } catch (error) {
      console.error("Error loading universityKey from localStorage:", error);
      return "halic";
    }
  });

  // Get the full university configuration
  const university = UNIVERSITY_CONFIG[universityKey] || UNIVERSITY_CONFIG.halic;

  // Save to localStorage whenever universityKey changes
  useEffect(() => {
    try {
      localStorage.setItem("universityKey", universityKey);
    } catch (error) {
      console.error("Error saving universityKey to localStorage:", error);
    }
  }, [universityKey]);

  /**
   * Check if a program belongs to the current university
   * @param {object} program - Program object with university field
   * @returns {boolean}
   */
  const isOwnUniversity = (program) => {
    if (!program || !program.university) return false;
    return program.university.toUpperCase() === university.name;
  };

  /**
   * Check if a university name matches the current university
   * @param {string} universityName - University name to check
   * @returns {boolean}
   */
  const isOwnUniversityName = (universityName) => {
    if (!universityName) return false;
    return universityName.toUpperCase() === university.name;
  };

  const setUniversityKey_direct = (key) => {
    if (UNIVERSITY_CONFIG[key]) {
      setUniversityKey(key);
    } else {
      console.warn(`Unknown university key: ${key}, defaulting to halic`);
      setUniversityKey("halic");
    }
  };

  const clearUniversity = () => {
    setUniversityKey("halic");
    localStorage.removeItem("universityKey");
  };

  return (
    <UniversityContext.Provider
      value={{
        universityKey,
        university,
        isOwnUniversity,
        isOwnUniversityName,
        setUniversityKey: setUniversityKey_direct,
        clearUniversity,
        UNIVERSITY_CONFIG,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
};
