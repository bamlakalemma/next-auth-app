export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }

  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }

  if (password.length < 6) {
    return { field: 'password', message: 'Password must be at least 6 characters long' };
  }

  return null;
}

export function validateName(name: string): ValidationError | null {
  if (!name) {
    return { field: 'name', message: 'Name is required' };
  }

  if (name.length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationError | null {
  if (!confirmPassword) {
    return { field: 'confirmPassword', message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }

  return null;
}

export function validateRole(role: string): ValidationError | null {
  if (!role) {
    return { field: 'role', message: 'Role is required' };
  }

  return null;
}

export function validateOTP(otp: string): ValidationError | null {
  if (!otp) {
    return { field: 'OTP', message: 'OTP is required' };
  }

  if (otp.length !== 4 || !/^\d+$/.test(otp)) {
    return { field: 'OTP', message: 'OTP must be a 4-digit number' };
  }

  return null;
}

export function validateSignupForm(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmPasswordError) errors.push(confirmPasswordError);

  const roleError = validateRole(data.role);
  if (roleError) errors.push(roleError);

  return errors;
}

export function validateSigninForm(data: {
  email: string;
  password: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  return errors;
}

