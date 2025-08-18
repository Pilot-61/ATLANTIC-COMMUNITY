# ATC - Community Management Platform

## Overview
ATC is a modern community management platform inspired by TXAdmin, built with React, Supabase, and Tailwind CSS. It provides robust user management, admin controls, and a responsive, mobile-friendly UI for managing users, announcements, and community rules.

## Features
- **User Authentication**: Secure login and registration using Supabase Auth.
- **User Management**: Admins can view, search, ban, and promote users to admin status.
- **Ban Enforcement**: Banned users are automatically logged out and shown a banned page.
- **Announcements**: Public blog/announcement system with comment gating (login required to comment).
- **Responsive UI**: TXAdmin-inspired, smooth, and fully responsive for desktop and mobile.
- **Admin Controls**: Dedicated user management page, admin-only actions, and protected routes.
- **Modern Navigation**: Adaptive navigation bar with admin links visible on all devices.

## Tech Stack
- [React](https://react.dev/) (Vite, TypeScript)
- [Supabase](https://supabase.com/) (Auth, Database, RLS)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started
1. **Clone the repository:**
	```bash
	git clone <repo-url> <repo-name>
	cd <repo-name>
	```
2. **Install dependencies:**
	```bash
	npm install
	```
3. **Configure Supabase:**
	- Create a project at [Supabase](https://supabase.com/)
	- Copy your Supabase URL and anon/public key
	- Update `/src/lib/supabase.ts` with your credentials
	- Run the SQL migration in `supabase/migrations/` to set up tables and RLS
4. **Run the development server:**
	```bash
	npm run dev
	```

## Project Structure
- `src/components/` - React components (UserManagementPage, Navigation, Auth, etc.)
- `src/contexts/` - React context for authentication and user state
- `src/lib/` - Supabase client, helper functions
- `public/` - Static assets
- `supabase/migrations/` - Database schema and RLS policies

Configure your production environment variables as needed.

## Credits
- Built with [React](https://react.dev/), [Supabase](https://supabase.com/), and [Tailwind CSS](https://tailwindcss.com/)

## License
MIT
