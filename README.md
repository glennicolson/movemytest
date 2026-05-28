# MoveMyTest

A standalone spin-off project from The DTC's Test Swap feature. MoveMyTest is a free driving test swap service that helps learners find compatible matches to exchange DVSA driving test bookings.

## Origin

This project was extracted from the main DTC (Driver Training Centre) codebase, specifically the `test-swap` feature. All existing DTC Test Swap functionality has been preserved and rebranded as MoveMyTest.

## What's Included

- **Learner Portal**: Registration, login, dashboard, test swap listings, matches
- **Instructor Portal**: Instructor registration, dashboard, learner linking, calendar
- **Admin Dashboard**: Staff overview of all test swap activity
- **API Routes**: Backend handlers for matches, auth, support tickets, etc.
- **Marketing Pages**: Home, how-it-works, test centres, support

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma (database ORM)
- Resend (email)
- Stripe (payments - if needed for contributions)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials, Resend API key, etc.

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The dev server runs on port 6003 by default.

## Important Notes

- This project uses **its own session cookies** (`movemytest_session`, `movemytest_instructor_session`, etc.) so it does not conflict with DTC sessions.
- The database schema is shared with DTC for now (same Prisma schema). If you need full separation, copy the schema and create a new database.
- All branding references to "The DTC Test Swap" have been replaced with "MoveMyTest".

## Project Structure

```
movemytest/
├── src/
│   ├── app/              # Next.js routes
│   │   ├── (marketing)/movemytest/    # Marketing pages
│   │   ├── (auth)/movemytest/         # Auth pages (login, register, etc.)
│   │   ├── (staff)/dashboard/movemytest/  # Admin dashboard
│   │   └── api/movemytest/            # API routes
│   ├── components/
│   │   ├── movemytest/   # MoveMyTest-specific components
│   │   ├── ui/           # Shared UI components
│   │   ├── layout/       # Layout components
│   │   └── ...           # Other shared components
│   ├── features/
│   │   ├── movemytest/   # Core MoveMyTest logic (auth, matching, sessions)
│   │   ├── crm/          # CRM helpers
│   │   ├── calendar/     # Calendar feature
│   │   └── ...           # Other features
│   ├── lib/              # Utilities, database, auth guards
│   ├── hooks/            # React hooks
│   └── types/            # TypeScript types
├── prisma/               # Database schema
├── public/               # Static assets
└── ...                   # Config files
```

## Differences from DTC

- Standalone project with no DTC CRM, instructor management, or learner portal dependencies
- Own branding and identity
- Can be deployed independently
- Session isolation from DTC

## License

Same as parent DTC project.
