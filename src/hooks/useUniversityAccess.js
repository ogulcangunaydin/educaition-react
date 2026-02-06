import { useMemo } from "react";
import { useAuth } from "@contexts/AuthContext";
import { ROLES, UNIVERSITIES } from "@config/permissions";

export default function useUniversityAccess() {
  const { user, isAdmin, canAccessUniversity } = useAuth();

  const accessibleUniversities = useMemo(() => {
    if (!user) return [];
    if (user.role === ROLES.ADMIN) return Object.values(UNIVERSITIES);
    return [user.university];
  }, [user]);

  const filterByUniversity = useMemo(() => {
    return (items, universityKey = "university") => {
      if (!user) return [];
      if (isAdmin) return items;
      return items.filter((item) => item[universityKey] === user.university);
    };
  }, [user, isAdmin]);

  const defaultUniversity = useMemo(() => {
    if (!user) return null;
    if (isAdmin) return UNIVERSITIES.HALIC;
    return user.university;
  }, [user, isAdmin]);

  return {
    userUniversity: user?.university,
    accessibleUniversities,
    canAccessAllUniversities: isAdmin,
    canAccessUniversity,
    filterByUniversity,
    defaultUniversity,
  };
}
