import type { UserProfile } from '../types';

function norm(s: string): string {
  return (s || '').trim().toLowerCase();
}

/**
 * Checks if a profile matches the viewer's preferences.
 * Handles normalization and default behavior (show all if no prefs).
 */
export function matchesPreferences(profile: UserProfile, preferredCategories: string[] | undefined): boolean {
  if (!preferredCategories || preferredCategories.length === 0) return true;

  const preferred = new Set(preferredCategories.map(norm));
  const profileCats =
    profile.categories && profile.categories.length > 0 ? profile.categories : [profile.category];

  return profileCats.map(norm).some((c) => preferred.has(c));
}
