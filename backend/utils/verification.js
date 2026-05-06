// Key feature: Calculates role-specific profile completion and verification state.
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

export const getVerificationRequirements = (user) => {
  if (user.role === "recruiter") {
    const profile = user.companyProfile || {};

    return [
      ["Company name", hasText(profile.companyName)],
      ["Company logo", hasText(profile.companyLogo)],
      ["Company bio", hasText(profile.bio)],
      ["Employee count", Number(profile.employeeCount) > 0],
      ["Founded year", Number(profile.foundedYear) > 0],
      ["Founded by", hasText(profile.foundedBy)],
    ];
  }

  const profile = user.candidateProfile || {};

  return [
    ["Headline", hasText(profile.headline)],
    ["Bio", hasText(profile.bio)],
    ["Tech stack", Array.isArray(profile.techStack) && profile.techStack.length > 0],
    [
      "Years of experience",
      profile.yearsOfExperience !== null &&
        profile.yearsOfExperience !== undefined &&
        Number(profile.yearsOfExperience) >= 0,
    ],
    ["Portfolio URL", hasText(profile.portfolioUrl)],
    ["Location", hasText(profile.location)],
  ];
};

export const computeVerification = (user) => {
  const requirements = getVerificationRequirements(user);
  const completed = requirements.filter(([, isComplete]) => isComplete).length;

  return {
    isVerified: completed === requirements.length,
    completed,
    total: requirements.length,
    missing: requirements
      .filter(([, isComplete]) => !isComplete)
      .map(([label]) => label),
  };
};
