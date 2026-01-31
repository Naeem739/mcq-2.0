# Multi-Tenant Setup Guide

This application now supports multiple sites/tenants where each admin has their own:
- Separate password
- Separate students
- Separate quizzes and questions

## Database Schema Changes

The schema now includes:
- `Site` model - Each site has a unique code
- `Admin` model - Each admin belongs to a site and has username/password
- `User` model - Each user belongs to a site
- `Quiz` model - Each quiz belongs to a site

## Setup Steps

### 1. Run Database Migration

```bash
npx prisma migrate dev --name add_multi_tenant
```

### 2. Create Initial Site and Admin

You'll need to create a site and admin manually. Here's a script you can run:

```typescript
// scripts/createSite.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Create a site
  const site = await prisma.site.create({
    data: {
      name: 'My School',
      code: 'SCHOOL01', // Unique site code
    },
  });

  // Create an admin for this site
  const admin = await prisma.admin.create({
    data: {
      siteId: site.id,
      username: 'admin',
      password: hashPassword('admin123'), // Change this password
    },
  });

  console.log('Site created:', site);
  console.log('Admin created:', admin);
}

main();
```

### 3. User Registration

Users must provide a site code when:
- Signing up
- Logging in

The site code links them to the correct site.

## How It Works

1. **Admin Login**: Admin logs in with username/password. System finds their site.
2. **User Registration**: User provides site code. System creates user linked to that site.
3. **Data Isolation**: All queries filter by `siteId` to ensure complete data isolation.

## Important Notes

- Each site is completely isolated
- Users can only see quizzes from their site
- Admins can only manage quizzes from their site
- Site codes should be unique and shared with users
