# 🔐 Authentication Quick Reference

## URLs

| Feature | URL | Purpose |
|---------|-----|---------|
| Signup | `/auth/signup` | Create new account |
| Verify Email | `/auth/verify-email` | Enter 6-digit code |
| Login | `/auth/login` | Sign in with email/password |
| Practice | `/practice` | Protected quiz area |
| Admin Upload | `/admin/upload` | Admin-only quiz uploads |

## Testing Locally (Dev Mode)

### 1. Signup
```
Visit: http://localhost:3000/auth/signup
Enter:
  - Name: John Doe
  - Email: john@example.com
  - Password: password123
```

### 2. Get Verification Code
```
Check browser console or terminal:
[DEV] Verification code for john@example.com: ABC123
```

### 3. Verify Email
```
Paste code from console to verification page
→ Automatically logged in and redirected
```

### 4. Login
```
Visit: http://localhost:3000/auth/login
Enter:
  - Email: john@example.com
  - Password: password123
→ Redirects to /practice
```

## Code Architecture

### User Registration Flow
```
SignupForm (client)
    ↓
signupAction (server)
    ↓
[Validate data, hash password, create user]
    ↓
[Generate 6-digit code, set 15-min expiration]
    ↓
[Send email or log to console]
    ↓
Redirect to /auth/verify-email
```

### Email Verification Flow
```
VerifyEmailForm (client)
    ↓
verifyEmailAction (server)
    ↓
[Validate code and expiration]
    ↓
[Mark email as verified]
    ↓
[Set user session cookie]
    ↓
Redirect to /auth/login
```

### Login Flow
```
LoginForm (client)
    ↓
loginAction (server)
    ↓
[Find user by email]
    ↓
[Verify password hash]
    ↓
[Check email is verified]
    ↓
[Set user session cookie - 30 days]
    ↓
Redirect to /practice
```

## Database Schema

```sql
CREATE TABLE "User" (
  id String PRIMARY KEY,
  name String NOT NULL,
  email String UNIQUE NOT NULL,
  password String NOT NULL,
  emailVerified Boolean DEFAULT false,
  verificationCode String,
  verificationCodeExpiresAt DateTime,
  createdAt DateTime DEFAULT now(),
  updatedAt DateTime DEFAULT now()
);
```

## Key Functions

### In `src/lib/auth.ts`

```typescript
// Check user session
await isUserAuthed() → boolean

// Get user from cookie
await getUserFromCookie() → { userId, email } | null

// Set user session
await setUserCookie(userId, email)

// Clear user session
await clearUserCookie()

// Hash password
hashPassword(password: string) → string

// Verify password
verifyPassword(password: string, hash: string) → boolean

// Generate 6-char code
generateVerificationCode() → string

// Check if code expired
isVerificationCodeExpired(expiresAt: Date) → boolean
```

### In `src/lib/email.ts`

```typescript
// Send verification email
async sendVerificationEmail(email: string, code: string) → boolean
```

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/mcq_maker

# Optional
ADMIN_PASSWORD=admin123
EMAIL_SERVICE_URL=https://api.resend.com/emails
EMAIL_API_KEY=your_key_here
```

## Security Details

- **Password Hashing**: PBKDF2, 1000 iterations, SHA-512
- **Verification Code**: 6 uppercase alphanumeric, 15-minute expiration
- **Session Cookie**: HttpOnly, SameSite=Lax, Secure in production, 30-day expiration
- **Protected Routes**: Middleware blocks unauthorized access

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Email already registered" | Use a different email address |
| "Invalid verification code" | Check console for correct code (dev mode) |
| "Please verify your email first" | Complete email verification before login |
| Can't login after signup | Verification code may have expired (15 min limit) |
| Verification code not showing | Check browser console or terminal logs |

## Production Checklist

- [ ] Update DATABASE_URL to production database
- [ ] Set ADMIN_PASSWORD to strong password
- [ ] Configure EMAIL_SERVICE_URL and EMAIL_API_KEY
- [ ] Test signup→verify→login flow
- [ ] Enable HTTPS (secure cookies)
- [ ] Add rate limiting to auth endpoints
- [ ] Set up error monitoring/logging
- [ ] Add reCAPTCHA to signup form
- [ ] Configure email service properly
- [ ] Test on production database

## File Structure

```
src/
├── lib/
│   ├── auth.ts ................. Auth utilities & cookies
│   └── email.ts ................ Email service integration
├── app/
│   ├── auth/
│   │   ├── signup/
│   │   │   ├── page.tsx ........ Signup page
│   │   │   ├── actions.ts ...... Signup & verify server actions
│   │   │   ├── SignupForm.tsx .. Signup form component
│   │   │   └── VerifyEmailForm.tsx .. Verification form
│   │   ├── login/
│   │   │   ├── page.tsx ........ Login page
│   │   │   ├── actions.ts ...... Login server actions
│   │   │   └── LoginForm.tsx ... Login form component
│   │   └── verify-email/
│   │       └── page.tsx ........ Email verification page
│   └── components/
│       ├── AuthNav.tsx ......... Auth navigation (Login/Signup/Logout)
│       └── Header.tsx .......... Updated with AuthNav
├── middleware.ts ............... Route protection
└── prisma/
    └── schema.prisma .......... Updated with User model
```

## Next.js Integration

- ✅ Server components (faster rendering)
- ✅ Server actions (secure backend calls)
- ✅ Middleware protection (automatic redirects)
- ✅ App router (modern routing)
- ✅ Type-safe forms (Zod ready)

## Helpful Commands

```bash
# Start development
npm run dev

# Run database migrations
npm run prisma:migrate

# Check database
npm run prisma:studio

# Lint code
npm run lint

# Build for production
npm build
```
