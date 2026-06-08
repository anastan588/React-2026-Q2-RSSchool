export const checkPasswordStrength = (password: string) => {
  return {
    hasNumber: /\d/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
};

export const validateEmailWithoutRegex = (email: string): boolean => {
  if (!email) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith("."))
    return false;

  return true;
};
