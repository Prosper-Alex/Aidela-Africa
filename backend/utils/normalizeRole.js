// Key feature: Normalizes role values so old and new role names behave consistently.
const ROLE_ALIASES = {
  employer: "recruiter",
};

export const normalizeRole = (role) => {
  if (!role) {
    return role;
  }

  const normalizedRole = `${role}`.toLowerCase();
  return ROLE_ALIASES[normalizedRole] || normalizedRole;
};
