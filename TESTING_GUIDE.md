# 🧪 Authentication Testing Guide

## Manual Testing Checklist

### 1. Signup Flow Testing

#### Test Case 1.1: Valid Registration
```
Steps:
1. Navigate to http://localhost:3000/auth/signup
2. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Password: SecurePass123
   - Confirm Password: SecurePass123
3. Click "Create Account"

Expected:
✓ Form submits successfully
✓ Redirected to /auth/verify-email?email=john@example.com
✓ Check console for code: [DEV] Verification code for john@example.com: ABC123
✓ See message: "A verification code has been sent to john@example.com"
```

#### Test Case 1.2: Duplicate Email
```
Steps:
1. Fill signup form with:
   - Email: john@example.com (already registered)
2. Click "Create Account"

Expected:
✗ Error message: "Email already registered"
✗ Form stays on signup page
✗ User data not created
```

#### Test Case 1.3: Mismatched Passwords
```
Steps:
1. Fill in:
   - Password: SecurePass123
   - Confirm Password: DifferentPass456
2. Click "Create Account"

Expected:
✗ Error message: "Passwords do not match"
✗ Form validation fails before server request
```

#### Test Case 1.4: Short Password
```
Steps:
1. Fill in:
   - Password: pass
   - Confirm Password: pass
2. Click "Create Account"

Expected:
✗ Error: "Password must be at least 6 characters"
✗ Form validation fails
```

#### Test Case 1.5: Invalid Email
```
Steps:
1. Fill in:
   - Email: notanemail
2. Click "Create Account"

Expected:
✗ Error: "Valid email is required"
✗ Form validation fails
```

---

### 2. Email Verification Testing

#### Test Case 2.1: Valid Code
```
Steps:
1. Complete signup to reach verification page
2. Copy code from console: ABC123
3. Enter code in verification form
4. Click "Verify Email"

Expected:
✓ Code validates successfully
✓ Email marked as verified in database
✓ Redirected to /auth/login
✓ User can now login
```

#### Test Case 2.2: Invalid Code
```
Steps:
1. On verification page, enter: WRONG1
2. Click "Verify Email"

Expected:
✗ Error: "Invalid verification code"
✗ Stay on verification page
✗ Email not marked verified
```

#### Test Case 2.3: Expired Code (Manual Test)
```
Manual Steps:
1. In PostgreSQL directly update the expiration:
   UPDATE "User" 
   SET "verificationCodeExpiresAt" = NOW() - INTERVAL '1 hour'
   WHERE email = 'test@example.com';

2. Try to verify with the old code

Expected:
✗ Error: "Verification code has expired"
✗ User must sign up again
```

#### Test Case 2.4: Code Expiration (Automatic)
```
Steps:
1. Complete signup
2. Wait 15+ minutes
3. Enter code on verification page
4. Click "Verify Email"

Expected:
✗ Error: "Verification code has expired"
✗ Must sign up again to get new code
```

---

### 3. Login Flow Testing

#### Test Case 3.1: Valid Login (After Verification)
```
Steps:
1. Complete signup and verification
2. Navigate to /auth/login
3. Enter:
   - Email: john@example.com
   - Password: SecurePass123
4. Click "Sign in"

Expected:
✓ Login successful
✓ Redirected to /practice
✓ User session created (check browser cookies)
✓ Can access protected content
```

#### Test Case 3.2: Unverified User Cannot Login
```
Steps:
1. Create user but don't verify email (in DB):
   INSERT INTO "User" ...
   emailVerified = false

2. Try to login with that user

Expected:
✗ Error: "Please verify your email first"
✗ Cannot proceed to /practice
```

#### Test Case 3.3: Wrong Password
```
Steps:
1. Login with:
   - Email: john@example.com
   - Password: WrongPassword
2. Click "Sign in"

Expected:
✗ Error: "Invalid email or password"
✗ Stay on login page
✗ No session created
```

#### Test Case 3.4: Non-existent Email
```
Steps:
1. Login with:
   - Email: notexist@example.com
   - Password: anything
2. Click "Sign in"

Expected:
✗ Error: "Invalid email or password"
✗ Doesn't reveal user doesn't exist
✗ Stay on login page
```

---

### 4. Session & Cookie Testing

#### Test Case 4.1: Session Persistence
```
Steps:
1. Login successfully
2. Navigate to different pages on the site
3. Check browser Developer Tools → Application → Cookies

Expected:
✓ Cookie "mcq_user" present
✓ Value contains userId and email
✓ HttpOnly flag enabled
✓ SameSite flag set to Lax
✓ Session persists across page navigation
```

#### Test Case 4.2: Protected Route Access
```
Steps:
1. Try to access /practice without logging in
2. Observe redirect

Expected:
✗ Redirect to /auth/login?next=/practice
✗ After login, redirect back to /practice
```

#### Test Case 4.3: Logout Clears Session
```
Steps:
1. Login successfully
2. In header, click "Log out"
3. Try to access /practice

Expected:
✓ Session cookie cleared
✗ Redirect to /auth/login
✗ Cannot access protected routes
```

#### Test Case 4.4: 30-Day Session Expiration
```
Manual Test:
1. Login and note creation time
2. Wait 30 days OR manually update cookie expiration in browser
3. Try to access /practice

Expected:
✗ Session expired
✗ Redirect to login
✗ Must login again
```

---

### 5. Password Security Testing

#### Test Case 5.1: Passwords are Hashed
```
Steps:
1. Use Prisma Studio: npm run prisma:studio
2. View User record
3. Look at password field

Expected:
✓ Password shown as hash, not plaintext
✓ Hash starts with random characters
✓ Two users with same password have different hashes
```

#### Test Case 5.2: Hash Not Reversible
```
Manual Test:
1. Store the hash of password "test123"
2. Try to reverse-engineer the password

Expected:
✗ Cannot reverse hash
✗ Hash is one-way (PBKDF2-SHA512)
✗ Only verification works, not decryption
```

---

### 6. Email Service Testing

#### Test Case 6.1: Development Mode (Console Logging)
```
Steps:
1. Sign up and check browser console
2. Look for message: [DEV] Verification code for ...

Expected:
✓ Code logged to console
✓ Code is 6 uppercase alphanumeric characters
✓ Email address shown in message
```

#### Test Case 6.2: Production Email Service (Manual)
```
If configured:
1. Set EMAIL_SERVICE_URL and EMAIL_API_KEY in .env
2. Sign up with real email
3. Check email inbox

Expected:
✓ Email received
✓ Contains verification code
✓ Professional formatting
✓ Code matches verification page input
```

---

### 7. Navigation & UI Testing

#### Test Case 7.1: Header Auth Navigation
```
Steps:
1. Visit home page without login
2. Check header

Expected:
✓ Shows "Log in" link
✓ Shows "Sign up" link
✓ No user email displayed
```

```
Steps:
2. Login
3. Check header

Expected:
✓ Shows user email
✓ Shows "Log out" button
✓ No "Log in" or "Sign up" links
```

#### Test Case 7.2: Form Responsive Design
```
Steps:
1. On desktop (1920x1080): Check form layout
2. On tablet (768x1024): Check form layout
3. On mobile (375x667): Check form layout

Expected:
✓ All forms responsive
✓ Inputs full width on mobile
✓ Buttons clickable on touch
✓ Text readable on all sizes
```

#### Test Case 7.3: Error Message Display
```
Steps:
1. Cause an error (wrong password, etc.)
2. Check error message

Expected:
✓ Error displayed in red box
✓ Message is clear and helpful
✓ Form remains filled (not cleared)
✓ User can correct and resubmit
```

---

## Browser DevTools Testing

### Checking Cookies

```javascript
// In browser console:

// Get all cookies
document.cookie

// Check if mcq_user cookie exists
document.cookie.includes('mcq_user')

// Check cookie attributes
// (DevTools → Application → Cookies → Select domain)
// Look for: mcq_user
// - Name: mcq_user
// - Value: {"userId":"...","email":"..."}
// - Domain: localhost (or your domain)
// - Path: /
// - Expires: [30 days from login]
// - HttpOnly: ✓ (checked)
// - Secure: ✓ (checked in production)
// - SameSite: Lax
```

### Checking Network Requests

```
1. Open DevTools → Network tab
2. Perform login
3. Look for POST request to signupAction or loginAction

Expected:
✓ Request shows form data sent
✓ Response shows redirect (302)
✓ Response includes Set-Cookie header
✓ Response shows cookie attributes
```

### Checking Local Storage

```javascript
// In browser console:

// Should be EMPTY (no sensitive data stored)
localStorage

// Should be EMPTY (cookies are HttpOnly)
sessionStorage

// Passwords only in cookie, hashed in database
```

---

## Automated Testing Examples

### Jest/Vitest Test Cases

```typescript
describe('Authentication', () => {
  describe('Signup', () => {
    it('should create user with hashed password', async () => {
      const result = await signupAction(formData);
      expect(result).toHaveProperty('ok');
      // Check database for user
      const user = await prisma.user.findUnique({
        where: { email: 'test@test.com' }
      });
      expect(user).toBeDefined();
      expect(user.password).not.toBe('plaintext');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await signupAction(formData1);
      // Try to create second with same email
      const result = await signupAction(formData2);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('already registered');
    });
  });

  describe('Email Verification', () => {
    it('should mark email as verified', async () => {
      // Setup
      const user = await createTestUser();
      const code = user.verificationCode;

      // Verify
      const result = await verifyEmailAction(formData);
      expect(result.ok).toBe(true);

      // Check database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser.emailVerified).toBe(true);
      expect(updatedUser.verificationCode).toBeNull();
    });
  });

  describe('Login', () => {
    it('should create session for verified user', async () => {
      // Create and verify user
      const user = await createVerifiedUser();

      // Login
      const result = await loginAction(formData);
      expect(result.ok).not.toBe(false);

      // Check cookie would be set
      // (In real test, use mock cookies)
    });
  });
});
```

---

## Load Testing (Locust Example)

```python
from locust import HttpUser, task, between

class AuthUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def signup(self):
        self.client.post("/auth/signup", data={
            "name": "Test User",
            "email": f"test{random()}@example.com",
            "password": "password123",
            "confirmPassword": "password123"
        })

    @task
    def login(self):
        self.client.post("/auth/login", data={
            "email": "verified@example.com",
            "password": "password123"
        })

    @task
    def practice(self):
        self.client.get("/practice")
```

---

## Production Deployment Verification

### Checklist Before Going Live

- [ ] Test signup flow end-to-end
- [ ] Test email service integration
- [ ] Test login with production database
- [ ] Verify HTTPS enabled
- [ ] Verify cookies marked Secure
- [ ] Test on production environment
- [ ] Monitor error logs
- [ ] Test password reset (if implemented)
- [ ] Load test signup endpoint
- [ ] Verify rate limiting works

---

## Troubleshooting Test Failures

| Test Fails | Likely Cause | Solution |
|-----------|-------------|----------|
| Email code not found | Running in production | Check EMAIL_SERVICE_URL env var |
| Cookie not persisting | Missing HttpOnly flag | Verify middleware sets cookies correctly |
| Login redirects wrongly | Middleware misconfigured | Check middleware.ts regex patterns |
| Database queries fail | Migration not run | Run `npm run prisma:migrate` |
| Password mismatch | Hashing issue | Check PBKDF2 salt consistency |
| Session expires quickly | maxAge incorrect | Default 30 days should be 2592000ms |

---

## Continuous Testing

### GitHub Actions Example

```yaml
name: Auth Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: mcq_test
        
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test
      - run: npm run lint
```

---

This comprehensive testing guide covers:
- Manual testing for all user flows
- Edge cases and error scenarios
- Browser DevTools verification
- Automated testing examples
- Load testing approaches
- Production deployment checks
