## Database Setup Instructions

The application is failing because the `survey` and `profiles` tables do not exist in your Supabase database. Please follow these instructions to create them.

1.  Go to your Supabase project dashboard.
2.  In the left sidebar, click on the "SQL Editor" icon.
3.  Click on "New query".
4.  Copy the following SQL code and paste it into the query editor:

```sql
CREATE TABLE IF NOT EXISTS survey (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

CREATE TABLE IF NOT EXISTS daily_intake (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    amount_oz INT,
    UNIQUE(user_id, date)
);
```

5.  Click the "Run" button.

After you have created the tables, the application should work as expected.
