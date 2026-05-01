// Counts how much of a user's profile is filled in.
export const computeVerification = (user) => {
  const profile =
    user.role === "recruiter" ? user.companyProfile : user.candidateProfile;

  const total = Object.keys(profile || {}).length;

  const completed = Object.values(profile || {}).filter((val) => {
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return val !== null && val !== undefined;
  }).length;

  return {
    isVerified: completed >= 4,
    completed,
    total,
  };
};
