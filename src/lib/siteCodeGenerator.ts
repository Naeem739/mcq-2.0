/**
 * Generate a unique 12-digit site code
 */
export function generateSiteCode(): string {
  // Generate 12 random digits
  const digits = Array.from({ length: 12 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  return digits;
}
