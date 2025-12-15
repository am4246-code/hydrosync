// Mock the Supabase client (only if still needed by other parts of the test setup)
jest.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      admin: {
        deleteUser: jest.fn(),
      },
    },
    from: jest.fn(), // Mock the .from method itself
    functions: {
      invoke: jest.fn(),
    },
  },
}));

// mockUser is no longer used after removing deleteAccount tests.
/*
const mockUser: User = {
  id: 'test-user-id',
  app_metadata: {},
  aud: 'authenticated',
  created_at: '',
  user_metadata: {},
  email: 'test@example.com',
  phone: '',
  role: 'authenticated',
  updated_at: '',
};
*/


