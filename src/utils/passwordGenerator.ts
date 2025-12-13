// Memorable password generator that follows validation rules:
// - At least 8 characters
// - Contains uppercase, lowercase, digit, and special character
// - No spaces
// - Easy to remember

const adjectives = [
  'Happy', 'Bright', 'Swift', 'Clever', 'Brave', 'Quick', 'Smart', 'Strong',
  'Wise', 'Bold', 'Fresh', 'Noble', 'Sharp', 'Proud', 'Grand', 'Eager',
  'Calm', 'Kind', 'Fair', 'Pure', 'Clear', 'Keen', 'Vital', 'Royal'
];

const nouns = [
  'Tiger', 'Eagle', 'Lion', 'Wolf', 'Bear', 'Hawk', 'Shark', 'Dragon',
  'Phoenix', 'Falcon', 'Panther', 'Cobra', 'Raven', 'Storm', 'Thunder',
  'Ocean', 'Mountain', 'River', 'Forest', 'Star', 'Moon', 'Sun', 'Sky'
];

const specialChars = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?'];

/**
 * Generates a memorable password that follows all validation rules
 * Format: AdjectiveNoun + 2-3 digits + special char
 * Example: BraveTiger47!, SwiftEagle82@, CleverWolf15#
 */
export const generateMemorablePassword = (): string => {
  // Pick random adjective and noun
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // Generate 2-3 random digits
  const digitCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 digits
  let digits = '';
  for (let i = 0; i < digitCount; i++) {
    digits += Math.floor(Math.random() * 10);
  }
  
  // Pick random special character
  const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Combine: AdjectiveNoun + digits + special
  const password = `${adjective}${noun}${digits}${specialChar}`;
  
  return password;
};

/**
 * Validates if password meets all requirements
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  if (password.includes(' ')) {
    errors.push('Password must not contain spaces');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[!@#$%^&*()_+=\[\]{}|;:,.<>?/\\-]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generates multiple password options for user to choose from
 */
export const generatePasswordOptions = (count: number = 3): string[] => {
  const passwords: string[] = [];
  for (let i = 0; i < count; i++) {
    passwords.push(generateMemorablePassword());
  }
  return passwords;
};