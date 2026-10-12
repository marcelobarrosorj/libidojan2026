import { describe, it, expect } from 'vitest';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getFriendshipStatus,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getSocialCounts
} from '../services/social';

describe('Social service', () => {
  it('exporta todas as funcoes de amizade e seguir', () => {
    expect(typeof sendFriendRequest).toBe('function');
    expect(typeof acceptFriendRequest).toBe('function');
    expect(typeof rejectFriendRequest).toBe('function');
    expect(typeof removeFriend).toBe('function');
    expect(typeof getFriends).toBe('function');
    expect(typeof getPendingRequests).toBe('function');
    expect(typeof getFriendshipStatus).toBe('function');
    expect(typeof followUser).toBe('function');
    expect(typeof unfollowUser).toBe('function');
    expect(typeof isFollowing).toBe('function');
    expect(typeof getFollowers).toBe('function');
    expect(typeof getFollowing).toBe('function');
    expect(typeof getSocialCounts).toBe('function');
  });
});