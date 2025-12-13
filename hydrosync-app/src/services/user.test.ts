import { supabase } from './supabase';
import { deleteAccount } from './user';
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

describe('deleteAccount', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({ error: null });

    // Mock supabase.from for successful deletion
    (supabase.from as jest.Mock).mockImplementation((tableName) => {
      return {
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            error: null,
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {},
              error: null,
            })),
          })),
        })),
      };
    });
  });

  test('should successfully delete user data and account', async () => {
    await deleteAccount();

    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
    expect(supabase.from).toHaveBeenCalledWith('daily_intake');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.functions.invoke).toHaveBeenCalledWith('delete-user', {
      method: 'POST',
      body: { id: mockUser.id },
    });
  });

  test('should throw error if no user is signed in', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

    await expect(deleteAccount()).rejects.toThrow('No user is currently signed in.');
    expect(supabase.from).not.toHaveBeenCalled();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  test('should throw error if daily_intake deletion fails', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: { message: 'Failed to delete water intake' },
        })),
      })),
    });

    await expect(deleteAccount()).rejects.toThrow('Failed to delete water intake data: Failed to delete water intake');
  });

  test('should throw error if profiles deletion fails', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            error: null,
          })),
        })),
      }) // daily_intake success
      .mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            error: { message: 'Failed to delete profile' },
          })),
        })),
      }); // profiles failure

    await expect(deleteAccount()).rejects.toThrow('Failed to delete profile data: Failed to delete profile');
  });

  test('should throw error if auth deletion fails', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({ error: { message: 'Failed to delete auth user' } });

    await expect(deleteAccount()).rejects.toThrow('Failed to delete user account: Failed to delete auth user');
  });
});
