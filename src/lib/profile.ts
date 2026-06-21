export interface UserProfile {
  name: string;
  avatarDataUrl?: string;
}

const PROFILE_KEY = "magmos_user_profiles_v1";

function readAllProfiles(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, UserProfile>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeAllProfiles(profiles: Record<string, UserProfile>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}

export function loadProfile(address?: string | null): UserProfile | null {
  if (!address) return null;
  const profiles = readAllProfiles();
  return profiles[address] ?? null;
}

export function saveProfile(address: string, profile: UserProfile) {
  const profiles = readAllProfiles();
  profiles[address] = profile;
  writeAllProfiles(profiles);
}
