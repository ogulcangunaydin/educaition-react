import React, { createContext, useContext, useState, useEffect } from "react";

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
};

export const useUniversity = () => {
  const context = useContext(UniversityContext);
  if (!context) {
    throw new Error("useUniversity must be used within a UniversityProvider");
  }
  return context;
};

/**
 * Parse username to extract university suffix
 * @param {string} username - The username (e.g., "john.halic", "john.ibnhaldun", "john")
 * @returns {string} - University key ("halic" or "ibnhaldun")
 */
export const parseUniversityFromUsername = (username) => {
  if (!username) return "halic";

  const parts = username.toLowerCase().split(".");
  const lastPart = parts[parts.length - 1];

  if (lastPart === "ibnhaldun") {
    return "ibnhaldun";
  }

  // Default to halic for any other case (including .halic suffix or no suffix)
  return "halic";
};

export const UniversityProvider = ({ children }) => {
  const [universityKey, setUniversityKey] = useState(() => {
    try {
      const saved = localStorage.getItem("universityKey");
      return saved || "halic";
    } catch (error) {
      console.error("Error loading universityKey from localStorage:", error);
      return "halic";
    }
  });

  // Get the full university configuration
  const university =
    UNIVERSITY_CONFIG[universityKey] || UNIVERSITY_CONFIG.halic;

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

  /**
   * Set university from username (called after login)
   * @param {string} username - The username
   */
  const setUniversityFromUsername = (username) => {
    const key = parseUniversityFromUsername(username);
    setUniversityKey(key);
  };

  /**
   * Clear university data (for logout)
   */
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
        setUniversityFromUsername,
        clearUniversity,
        UNIVERSITY_CONFIG,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
};
