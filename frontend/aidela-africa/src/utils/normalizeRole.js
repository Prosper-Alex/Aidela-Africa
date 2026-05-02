// Key feature: Normalizes API role values for frontend role checks.
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

export const normalizeUserRole = (user) => {
  if (!user) {
    return user;
  }

  return {
    ...user,
    role: normalizeRole(user.role),
  };
};
