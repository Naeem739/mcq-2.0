# Authentication Setup Guide

This guide explains the new user authentication system added to the Quiz Practice application.

## Features

✅ **User Registration (Signup)**
- Name, email, password
- Email verification with 6-digit code
- Password hashing with PBKDF2

✅ **User Login**
- Email and password authentication
- Only verified users can log in
- Session management with cookies

✅ **Email Verification**
- Automatic code generation (6 alphanumeric characters)
- 15-minute expiration time
- Development mode logs codes to console
- Production mode can integrate with email services (Resend, SendGrid, etc.)

## Database Schema

New `User` model added to `prisma/schema.prisma`:

```prisma
model User {
  id            String     @id @default(cuid())
  name          String
  email         String     @unique
  password      String     // hashed with PBKDF2
  emailVerified Boolean    @default(false)
  verificationCode String?
  verificationCodeExpiresAt DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

## Routes

### User Routes
- `/auth/signup` - Registration page
- `/auth/verify-email` - Email verification page
- `/auth/login` - Login page
- `/practice` - Protected practice area (requires login)

### Admin Routes
- `/admin/login` - Admin login (password-based)
- `/admin/upload` - Quiz upload (admin only)

## File Structure

```
src/
├── lib/
│   ├── auth.ts          # Authentication utilities
│   └── email.ts         # Email service integration
├── app/
│   ├── auth/
│   │   ├── signup/
│   │   │   ├── page.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── VerifyEmailForm.tsx
│   │   │   └── actions.ts
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── actions.ts
│   │   └── verify-email/
│   │       └── page.tsx
│   └── components/
│       └── AuthNav.tsx  # Auth navigation component
```

## Setup Instructions

### 1. Update Database

Run migrations to create the `User` table:

```bash
npm run prisma:migrate
# Or
npx prisma migrate dev --name add_user_model
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Database URL (already configured)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mcq_maker?schema=public"

# Admin password (already configured)
ADMIN_PASSWORD="change-me"

# Optional: Email service (for production)
# EMAIL_SERVICE_URL="https://api.resend.com/emails"
# EMAIL_API_KEY="your_api_key_here"
```

### 3. Email Service (Optional)

For production deployment, configure an email service:

**Option A: Using Resend (Recommended)**
```env
EMAIL_SERVICE_URL="https://api.resend.com/emails"
EMAIL_API_KEY="re_xxxxxxxxxxxxx"
```

**Option B: Using SendGrid**
```env
EMAIL_SERVICE_URL="https://api.sendgrid.com/v3/mail/send"
EMAIL_API_KEY="SG.xxxxxxxxxxxxx"
```

**Option C: Custom Email Service**
Update `src/lib/email.ts` to implement your preferred service.

## How It Works

### Signup Flow
1. User enters name, email, password at `/auth/signup`
2. Password is validated and hashed with PBKDF2
3. User record created with unverified email status
4. 6-digit verification code generated (15-minute expiration)
5. Verification email sent (or logged in dev mode)
6. User redirected to `/auth/verify-email`

### Verification Flow
1. User enters 6-digit code received via email
2. Code validated against stored code and expiration time
3. Email marked as verified
4. User automatically logged in and redirected to `/auth/login`

### Login Flow
1. User enters email and password at `/auth/login`
2. Email lookup and password verification
3. Check that email is verified
4. Session cookie set (30-day expiration)
5. User redirected to `/practice`

### Logout Flow
1. User clicks "Log out" button
2. Session cookie cleared
3. User redirected to home page

## Authentication Utilities

### Functions in `src/lib/auth.ts`

- `isUserAuthed()` - Check if user has valid session
- `getUserFromCookie()` - Get user data from session
- `setUserCookie()` - Create user session (called after login/verification)
- `clearUserCookie()` - Remove user session (called on logout)
- `hashPassword()` - Hash password with PBKDF2
- `verifyPassword()` - Verify password against hash
- `generateVerificationCode()` - Generate 6-character code
- `isVerificationCodeExpired()` - Check code expiration

## Middleware Protection

Protected routes configured in `middleware.ts`:
- `/admin/*` - Admin-only area (uses `mcq_admin` cookie)
- `/practice` - Requires user login (uses `mcq_user` cookie)
- `/practice/[quizId]` - Public quiz access

## Security Features

✅ Passwords hashed with PBKDF2 (1000 iterations)
✅ HttpOnly cookies (prevent XSS attacks)
✅ SameSite=Lax (prevent CSRF)
✅ Secure flag in production
✅ Email verification required before login
✅ Temporary verification codes with expiration
✅ Middleware protection for sensitive routes

## Testing

### Development Mode
In development, email verification codes are logged to the console:
```
[DEV] Verification code for user@example.com: ABC123
```

### Testing Signup Flow
1. Go to `http://localhost:3000/auth/signup`
2. Fill in name, email, password
3. Check console for verification code
4. Enter code on verification page
5. Automatically logged in and redirected to login page

### Testing Login Flow
1. Go to `http://localhost:3000/auth/login`
2. Enter email and password
3. Should redirect to `/practice` on success

## Future Enhancements

- [ ] Password reset via email
- [ ] OAuth integration (Google, GitHub)
- [ ] Profile management page
- [ ] User preferences/settings
- [ ] Account deletion
- [ ] Login history/device management
- [ ] Two-factor authentication
- [ ] Remember me functionality
