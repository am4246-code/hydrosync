import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Mock the Supabase client
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
