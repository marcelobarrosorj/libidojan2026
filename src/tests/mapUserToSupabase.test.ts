import { describe, it, expect } from 'vitest';
import { mapUserToSupabase, mapSupabaseToUser } from '../services/users';

describe('User mapping', () => {
  it('maps user_number from Supabase to frontend and removes it when sending to Supabase', () => {
    // 1. data.user_number = 1 resulta em user.userNumber = 1
    const supabaseData = { user_number: 1, user_id: '123' };
    const mappedUser = mapSupabaseToUser(supabaseData);
    
    expect(mappedUser.userNumber).toBe(1);
    expect(mappedUser.user_number).toBe(1);

    // 2. mapUserToSupabase remove userNumber e user_number
    const toSupabase = mapUserToSupabase(mappedUser);
    expect(toSupabase.userNumber).toBeUndefined();
    expect(toSupabase.user_number).toBeUndefined();
  });
});
