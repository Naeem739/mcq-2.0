// Email service integration
// Currently disabled - email verification has been removed
// To re-enable, implement this function with your email service

export async function sendVerificationEmail(email: string, code: string) {
  // Not used - verification removed
  console.log(`Email would be sent to ${email} with code ${code}`);
  return true;
}
