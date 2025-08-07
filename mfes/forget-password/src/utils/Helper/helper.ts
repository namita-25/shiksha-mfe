export const maskMobileNumber = (mobile: string) => {
  if (mobile.length < 2) return mobile;
  const first = mobile[0];
  const last = mobile[mobile.length - 1];
  const masked = '*'.repeat(mobile.length - 2);
  return first + masked + last;
};
