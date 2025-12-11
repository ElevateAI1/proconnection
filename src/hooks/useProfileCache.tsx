import { Profile, Psychologist, Patient } from './useProfile';

export interface ProfileCache {
  profile: Profile | null;
  psychologist: Psychologist | null;
  patient: Patient | null;
  userId: string | null;
  lastFetch: number;
}

// Cache global simplificado
let profileCache: ProfileCache = {
  profile: null,
  psychologist: null,
  patient: null,
  userId: null,
  lastFetch: 0
};

const CACHE_TTL = 30000; // 30 segundos

export const useProfileCache = () => {
  const getCache = (userId: string): ProfileCache | null => {
    const now = Date.now();
    if (profileCache.userId === userId && (now - profileCache.lastFetch) < CACHE_TTL) {
      return profileCache;
    }
    return null;
  };

  const setCache = (userId: string, data: {
    profile: Profile | null;
    psychologist: Psychologist | null;
    patient: Patient | null;
  }) => {
    profileCache = {
      ...data,
      userId,
      lastFetch: Date.now()
    };
  };

  const invalidateCache = () => {
    profileCache.lastFetch = 0;
  };

  const clearCache = () => {
    profileCache = {
      profile: null,
      psychologist: null,
      patient: null,
      userId: null,
      lastFetch: 0
    };
  };

  return {
    getCache,
    setCache,
    invalidateCache,
    clearCache
  };
};

