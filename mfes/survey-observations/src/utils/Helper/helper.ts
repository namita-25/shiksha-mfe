export const getLoggedInUserRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('role') || '';
  }
  return '';
};
export const getAge = (dobString: any) => {
  console.log(dobString);
  const dob = new Date(dobString);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  console.log(age);
  return age;
};
export const getAgeInMonths = (dobString: any) => {
  console.log(dobString);
  const dob = new Date(dobString);
  const today = new Date();

  const monthsOld =
    (today.getFullYear() - dob.getFullYear()) * 12 +
    (today.getMonth() - dob.getMonth());

  console.log(monthsOld);
  return monthsOld;
};
export const toPascalCase = (name: string | any) => {
  if (typeof name !== 'string') {
    return name;
  }

  return name
    ?.toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
