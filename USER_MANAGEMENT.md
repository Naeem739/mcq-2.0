# 📊 User Management & Database Queries

## Prisma Studio

View and manage users easily:

```bash
npm run prisma:studio
```

Then visit: http://localhost:5555

## Common Database Operations

### Using Prisma Client in scripts or API routes

```typescript
import { prisma } from "@/lib/prisma";

// Get all users
const allUsers = await prisma.user.findMany();

// Get user by email
const user = await prisma.user.findUnique({
  where: { email: "john@example.com" }
});

// Get verified users
const verifiedUsers = await prisma.user.findMany({
  where: { emailVerified: true }
});

// Get unverified users
const unverifiedUsers = await prisma.user.findMany({
  where: { emailVerified: false }
});

// Count total users
const totalUsers = await prisma.user.count();

// Count verified users
const verifiedCount = await prisma.user.count({
  where: { emailVerified: true }
});

// Delete a user
await prisma.user.delete({
  where: { email: "john@example.com" }
});

// Update user (verify email manually)
await prisma.user.update({
  where: { email: "john@example.com" },
  data: { emailVerified: true }
});

// List users created in last 24 hours
const recentUsers = await prisma.user.findMany({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  }
});
```

## Direct SQL Queries (Advanced)

If you need to run raw SQL:

```typescript
import { prisma } from "@/lib/prisma";

// Get user statistics
const stats = await prisma.$queryRaw`
  SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN "emailVerified" = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN "emailVerified" = false THEN 1 END) as unverified_users
  FROM "User"
`;

// Get signup trend (last 7 days)
const signupTrend = await prisma.$queryRaw`
  SELECT 
    DATE("createdAt") as signup_date,
    COUNT(*) as count
  FROM "User"
  WHERE "createdAt" >= NOW() - INTERVAL '7 days'
  GROUP BY DATE("createdAt")
  ORDER BY signup_date DESC
`;
```

## Creating Admin Pages (Optional)

You could create admin pages to manage users:

### `src/app/admin/users/page.tsx`

```typescript
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/adminAuth";

export default async function UsersPage() {
  if (!(await isAdminAuthed())) {
    return <div>Unauthorized</div>;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  const stats = {
    total: users.length,
    verified: users.filter(u => u.emailVerified).length,
    unverified: users.filter(u => !u.emailVerified).length
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Verified</div>
          <div className="text-2xl font-bold">{stats.verified}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Unverified</div>
          <div className="text-2xl font-bold">{stats.unverified}</div>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Verified</th>
            <th className="border border-gray-300 p-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border border-gray-300 p-2">{user.name}</td>
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">
                {user.emailVerified ? '✅' : '❌'}
              </td>
              <td className="border border-gray-300 p-2">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Troubleshooting

### Check if database is connected
```bash
npm run prisma:migrate status
```

### Reset database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### View all migrations
```bash
npx prisma migrate status
```

### Generate Prisma Client
```bash
npx prisma generate
```

## Monitoring

### Users per day signup rate
```sql
SELECT DATE(created_at) as day, COUNT(*) as signups
FROM "User"
GROUP BY DATE(created_at)
ORDER BY day DESC
LIMIT 30;
```

### Unverified users older than 7 days
```sql
SELECT email, created_at
FROM "User"
WHERE "emailVerified" = false 
AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Most active users (if tracking later)
```sql
SELECT email, COUNT(*) as quiz_attempts
FROM "User"
-- This assumes you add quiz attempt tracking later
GROUP BY email
ORDER BY quiz_attempts DESC;
```

## Database Backup

### Backup PostgreSQL
```bash
# Full backup
pg_dump -U postgres -d mcq_maker > backup.sql

# Compressed backup
pg_dump -U postgres -d mcq_maker | gzip > backup.sql.gz
```

### Restore from backup
```bash
psql -U postgres -d mcq_maker < backup.sql
```

## Notes

- User passwords are hashed and never stored in plaintext
- Verification codes expire after 15 minutes
- Session cookies last 30 days
- Email field is unique (prevents duplicate accounts)
- All timestamps are in UTC
