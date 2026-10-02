export const queryKeys = {
  spots: {
    all: ['spots'] as const,
    lists: () => [...queryKeys.spots.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.spots.lists(), { filters }] as const,
    /**
     * A nearby list is keyed by the position it was measured from, not by "the nearby list".
     * Two positions are two different answers, and sharing one entry between them would hand an
     * athlete distances measured from somewhere they no longer are.
     */
    nearby: (latitude: number, longitude: number, radiusM: number) =>
      [...queryKeys.spots.all, 'nearby', { latitude, longitude, radiusM }] as const,
    details: () => [...queryKeys.spots.all, 'detail'] as const,
    detail: (spotId: string) => [...queryKeys.spots.details(), spotId] as const,
    /** The signed-in athlete's own spots, keyed by who owns them. */
    owned: (userId: string) => [...queryKeys.spots.all, 'owned', userId] as const,
    /** One database search, keyed by the term so each term is cached as its own answer. */
    search: (query: string) => [...queryKeys.spots.all, 'search', query] as const,
  },
  favorites: {
    all: ['favorites'] as const,
    lists: () => [...queryKeys.favorites.all, 'list'] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    bySpot: (spotId: string) => [...queryKeys.reviews.lists(), spotId] as const,
    /** One athlete's reviews across every spot, for the profile's own list. */
    byUser: (userId: string) => [...queryKeys.reviews.all, 'user', userId] as const,
  },
  location: {
    all: ['location'] as const,
    /** The device's current position. One entry: there is one device. */
    current: () => [...queryKeys.location.all, 'current'] as const,
  },
  moderation: {
    all: ['moderation'] as const,
    /** The caller's own moderator flag, so the settings row and gates read one answer. */
    mine: () => [...queryKeys.moderation.all, 'mine'] as const,
    reports: () => [...queryKeys.moderation.all, 'reports'] as const,
  },
} as const;
