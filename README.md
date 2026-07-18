# TourBuddy Frontend

Frontend for **TourBuddy** — a travel companion platform built with React, TypeScript, Vite, and Tailwind CSS. Travelers can post tours, browse trips, join tours, message hosts, and manage their journeys.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| TypeScript | Type safety |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| React Router DOM v7 | Client-side routing |
| Recharts | Dashboard charts (admin) |
| Axios | HTTP client |
| oxlint | Linting |

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Route definitions, layout switching
│   ├── index.css              # Tailwind imports + global styles
│   ├── types/
│   │   └── index.ts           # All TypeScript interfaces (User, Post, Blog, Connect, etc.)
│   ├── api/
│   │   └── index.ts           # Axios instance / API helpers
│   │
│   ├── components/
│   │   ├── Navbar.tsx          # Global nav — logo, links, message icon + dropdown, notification bell + dropdown, mobile menu
│   │   ├── Footer.tsx          # Site footer
│   │   ├── ui/
│   │   │   ├── Container.tsx       # Responsive container (sm/md/lg)
│   │   │   ├── Breadcrumb.tsx      # Breadcrumb navigation
│   │   │   ├── LoadingSpinner.tsx  # Loading state
│   │   │   ├── SectionHeader.tsx   # Section title block
│   │   │   ├── PageHero.tsx        # Page hero banner
│   │   │   ├── EmptyState.tsx      # Empty state placeholder
│   │   │   └── FilterBar.tsx       # Search/filter bar
│   │   └── traveler/
│   │       ├── Icon.tsx            # SVG icon component (dashboard, message, tours, blog, profile, etc.)
│   │       ├── DashboardHome.tsx   # Traveler dashboard overview
│   │       ├── MyTours.tsx         # My posts management
│   │       ├── MyBlogs.tsx         # My blogs management
│   │       ├── Inbox.tsx           # Conversation list
│   │       ├── Chat.tsx            # Facebook-style chat (post title context, my msgs right)
│   │       ├── Notifications.tsx   # Notifications page with type badges
│   │       └── ProfileSettings.tsx # Edit profile, change password
│   │
│   └── pages/
│       ├── Home.tsx           # Hero slider, stats, featured tours, features, testimonials, blogs, FAQ
│       ├── Posts.tsx          # All tours — card grid (6/page), search, sort, filters
│       ├── PostDetail.tsx     # Tour detail — owner buttons, join/message, reviews
│       ├── Blogs.tsx          # All blogs
│       ├── BlogDetail.tsx     # Single blog
│       ├── About.tsx          # About page
│       ├── Contact.tsx        # Contact form
│       ├── Travelers.tsx      # All travelers
│       ├── TravelerDetail.tsx # Traveler profile + ratings
│       ├── Login.tsx          # Login with redirect to previous page
│       ├── Register.tsx       # Register with redirect to previous page
│       ├── TravelerDashboard.tsx  # Traveler panel (sidebar + routes)
│       ├── AdminDashboard.tsx     # Admin panel (sidebar + routes)
│       └── admin/
│           ├── ManageBanners.tsx      # Banner CRUD
│           ├── ManageSliders.tsx      # Slider CRUD
│           ├── ManageGuides.tsx       # Guide CRUD
│           ├── ManageAllBlogs.tsx     # Blog moderation
│           ├── ManageApplications.tsx # Application management
│           ├── ManageContact.tsx      # Contact info
│           └── ManageAbout.tsx        # About content
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000        # local
VITE_API_URL=https://tourbuddy-server-wlkl.onrender.com  # production
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint
```

## Routes

### Public Pages

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Hero slider, stats, featured tours, features, testimonials, blogs, FAQ |
| `/posts` | Posts | All tours — 6/page grid, search, sort, filter |
| `/post/:id` | PostDetail | Tour detail with join/message/review buttons |
| `/blogs` | Blogs | All approved blogs |
| `/blog/:id` | BlogDetail | Single blog post |
| `/about` | About | About page |
| `/contact` | Contact | Contact form |
| `/travelers` | Travelers | All travelers |
| `/traveler/:id` | TravelerDetail | Traveler profile + ratings |
| `/login` | Login | Login (redirects to previous page or homepage) |
| `/register` | Register | Register (redirects to previous page or homepage) |

### Traveler Dashboard (`/traveler/*`)

| Path | Page | Description |
|------|------|-------------|
| `/traveler` | DashboardHome | Overview stats |
| `/traveler/posts` | MyTours | CRUD my tour posts |
| `/traveler/blogs` | MyBlogs | CRUD my blogs |
| `/traveler/inbox` | Inbox | Conversation list |
| `/traveler/chat/:userId/:postId` | Chat | Facebook-style messaging |
| `/traveler/notifications` | Notifications | Notification list |
| `/traveler/profile` | ProfileSettings | Edit profile + password |

### Admin Dashboard (`/admin/*`)

| Path | Page | Description |
|------|------|-------------|
| `/admin` | Overview | Stats with Recharts (total posts, pending, travelers, guides) |
| `/admin/banners` | ManageBanners | Banner CRUD with image upload |
| `/admin/sliders` | ManageSliders | Slider CRUD with image upload |
| `/admin/guides` | ManageGuides | Guide CRUD with image upload |
| `/admin/blogs` | ManageAllBlogs | Blog moderation (approve/reject/delete) |
| `/admin/applications` | ManageApplications | Application management |
| `/admin/contact` | ManageContact | Contact info |
| `/admin/about` | ManageAbout | About content |

## Key Features

### Navbar
- Scroll-aware styling (transparent → solid on scroll)
- Desktop: nav links + message icon with dropdown + notification bell with dropdown + user avatar
- Mobile: hamburger menu with messages/notifications links with badges
- Unread count polling every 30 seconds
- `storage` event listener + pathname dependency for refresh-safe auth state

### Auth UX
- Login/Register redirects to the page user came from (`state.from`)
- Non-admin users redirected to homepage after login
- Login ↔ Register links preserve the `from` state

### Posts Page
- Entire card is clickable (wrapped in `<Link>`)
- 6 posts per page, 3-column grid
- Search + sort (newest, oldest, price low/high)
- Filter by status

### PostDetail — 3 Button States
- **Owner**: Edit Tour + Manage Requests (count) + Delete Tour
- **Other traveler**: Request to Join + Message Host
- **Not logged in**: Start Your Journey → redirects to login

### Chat (Facebook-style)
- My messages → RIGHT side (teal bubble)
- Other person's messages → LEFT side (gray bubble)
- Post title shown in chat header as clickable link
- Right-arrow send button

### Inbox
- Conversation list with other user name, last message, date, unread badge
- Post title context for each conversation
- Links to chat

### Notifications
- Types: join_request, approved, rejected (messages filtered out — messages go to Inbox only)
- Color-coded badges per type
- Mark all read + individual mark read + delete
- "Review" button for pending join requests

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tourbuddy.com | admin123 |
| Traveler | demo@tourbuddy.com | password123 |
