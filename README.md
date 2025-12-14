# HydroSync - Your Daily Water Tracker

HydroSync is a modern web application designed to help you track your daily water intake, set personalized hydration goals, earn achievements, and stay motivated with daily quotes.

## Table of Contents

1.  [Technology Stack](#technology-stack)
2.  [Prerequisites](#prerequisites)
3.  [Local Development Setup](#local-development-setup)
4.  [Supabase Project Setup](#supabase-project-setup)
5.  [Deployment to Vercel](#deployment-to-vercel)
6.  [Running Tests](#running-tests)
7.  [Features Implemented](#features-implemented)

---

## 1. Technology Stack

*   **Frontend:** React, TypeScript, React Router DOM, CSS
*   **Backend & Database:** Supabase (Authentication, PostgreSQL Database, Edge Functions)
*   **Edge Functions Runtime:** Deno
*   **Development Tools:** npm/Yarn, Jest/React Testing Library, Git
*   **Deployment:** Vercel

---

## 2. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js & npm/Yarn:**
    *   Node.js (LTS version recommended)
    *   npm (comes with Node.js) or Yarn
*   **Supabase CLI:** Follow the official Supabase CLI installation guide for your OS:
    *   [Supabase CLI Installation](https://supabase.com/docs/guides/cli)
    *   For Windows, consider using Scoop or Chocolatey. Example for Scoop:
        ```bash
        # Install Scoop (if not already installed)
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
        irm get.scoop.sh | iex
        # Install Supabase CLI
        scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
        scoop install supabase
        ```
*   **Git:** For version control.

---

## 3. Local Development Setup

Follow these steps to get HydroSync running on your local machine.

### 3.1. Clone the Repository

```bash
git clone https://github.com/am4246-code/hydrotracker.git
cd hydrotracker
```

### 3.2. Install Frontend Dependencies

Your React application resides in the `hydrosync-app/` subdirectory.

```bash
cd hydrosync-app
npm install # or yarn install
```

### 3.3. Configure Environment Variables

Create a `.env` file in the `hydrosync-app/` directory (i.e., `hydrosync-app/.env`) with your Supabase project details:

```
# .env inside hydrosync-app/
REACT_APP_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
REACT_APP_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

*   You can find these keys in your Supabase Dashboard under **Project Settings > API**.

### 3.4. Run the Development Server

```bash
npm start # or yarn start
```

This will open HydroSync in your browser, usually at `http://localhost:3000`.

---

## 4. Supabase Project Setup

HydroSync relies on a Supabase project for its backend.

### 4.1. Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com/) and create a new project.
2.  Note down your **Project URL** and **Anon (public) Key** from **Project Settings > API**.

### 4.2. Database Schema

You need to set up the necessary tables and Row Level Security (RLS) policies in your Supabase project.

#### `profiles` Table (example, adjust as per your project's `profiles` schema):

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  name text,
  daily_water_goal_oz integer,
  bottle_size_oz integer,
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);
```

#### `daily_intake` Table:

```sql
create table daily_intake (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  amount_oz integer not null default 0,
  created_at timestamp with time zone default now(),

  unique(user_id, date) -- Ensure only one entry per user per day
);

alter table daily_intake enable row level security;

create policy "Users can view their own daily intake." on daily_intake
  for select using (auth.uid() = user_id);

create policy "Users can insert their own daily intake." on daily_intake
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own daily intake." on daily_intake
  for update using (auth.uid() = user_id);
```

#### `user_emails` Table:

```sql
CREATE TABLE public.user_emails (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL
);

ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email" ON public.user_emails
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own email" ON public.user_emails
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own email" ON public.user_emails
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own email" ON public.user_emails
FOR DELETE USING (auth.uid() = id);
```

*   **How to apply schema:** Go to your Supabase Dashboard -> **SQL Editor**, and run these SQL commands one by one.

### 4.3. Supabase CLI Link & Environment Variables

1.  **Link your Local Project to your Supabase Project:**
    *   Open your terminal in the root of your `hydrotracker` project.
    *   Run: `supabase login`
    *   Run: `supabase link --project-ref YOUR_SUPABASE_PROJECT_ID`
        *   (Find your Project ID in Supabase Dashboard -> **Project Settings > General**).

---

## 5. Deployment to Vercel

To deploy your HydroSync application to Vercel:

1.  **Log in to Vercel:** Go to [vercel.com](https://vercel.com/) and log in.
2.  **Create a New Project:** Click "New Project" on your dashboard.
3.  **Import Git Repository:** Select your `am4246-code/hydrotracker` repository from GitHub.
4.  **Configure Project Settings:**
    *   **Project Name:** (e.g., `hydrosync`)
    *   **Framework Preset:** Vercel should auto-detect "Create React App".
    *   **Root Directory:** This is crucial! Enter `hydrosync-app/` here.
    *   **Build & Output Settings:** Usually default (`npm run build`, `build` output directory) works.
5.  **Set Environment Variables on Vercel:**
    *   In the Vercel project configuration, go to "Environment Variables."
    *   Add your Supabase keys:
        *   `REACT_APP_SUPABASE_URL` = `YOUR_SUPABASE_PROJECT_URL`
        *   `REACT_APP_SUPABASE_ANON_KEY` = `YOUR_SUPABASE_ANON_KEY`
    *   These are the same values from your `hydrosync-app/.env` file.
6.  **Deploy:** Click "Deploy." Vercel will build and deploy your application.

---

## 6. Running Tests

To run the client-side tests for the `hydrosync-app`:

1.  Navigate to the application directory:
    ```bash
    cd hydrosync-app
    ```
2.  Run tests:
    ```bash
    npm test # or yarn test
    ```
    To run specific tests (e.g., achievement tests):
    ```bash
    npm test src/services/achievements.test.ts
    ```

---

## 7. Features Implemented

This project includes:

*   **User Authentication:** Sign-up, Login, Logout (via Supabase Auth).
*   **Personalized Water Tracking:** Daily goal setting, water intake logging, visual progress indicator.
*   **Achievement System:** Earn badges for various hydration milestones.
*   **Daily Quotes:** Motivational quotes for consistent hydration.
*   **Weekly Progress Chart:** Visualize intake over the week.
*   **Privacy Policy Page:** Dedicated page for privacy information.
*   **Streamlined Sign-up Flow:** Immediate redirection to buffering screen, then to survey page after account creation.
*   **Password Requirements Display:** Real-time feedback on password strength during sign-up.
*   **User Email Display:** Shows linked email in settings.
*   **Responsive UI:** Modern and organized design.