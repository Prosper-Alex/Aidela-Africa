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
