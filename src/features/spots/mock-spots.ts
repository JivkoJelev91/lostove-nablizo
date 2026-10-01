import { CURRENT_USER_ID } from '@/features/profile/current-user';
import {
  SPOT_PHOTO,
  SPOT_PHOTO_MONKEY_BARS,
  SPOT_PHOTO_PULL_UP,
  SPOT_PHOTO_RINGS,
} from '@/features/spots/spot-photos';
import type { Spot } from '@/features/spots/types';
import { daysAgo } from '@/utils/dates';

/**
 * Mock spots around Sofia so every screen has something to be about. The coordinates are
 * approximations of real parks; the ratings, reviews, descriptions and distances are invented.
 *
 * A few spots carry more than one frame so the spot page's gallery has something to page
 * through; the single-frame spots keep the plain hero image.
 *
 * The seeds exercise every moderation state the frontend supports: most spots are approved,
 * and three are owned by the mock athlete in `under_review`, `rejected` and `closed` so the
 * profile has each state to show. Only `approved` spots reach the public discovery screens.
 */
export const MOCK_SPOTS: readonly Spot[] = [
  {
    id: 'trakia-fitness-park',
    name: 'Trakia Fitness Park',
    coordinate: { latitude: 42.6612, longitude: 23.3697 },
    rating: 4.7,
    reviewCount: 28,
    equipment: [
      { name: 'Pull-up', quantity: 2 },
      { name: 'Dips', quantity: 2 },
      { name: 'Rings' },
      { name: 'Monkey bars' },
      { name: 'Sit-up bench', quantity: 2 },
    ],
    condition: 'good',
    description:
      'Outdoor fitness area with pull-up bars, parallel dip bars, gymnastic rings and monkey bars. The stations sit on rubberised ground under the trees, so a session works right after rain.',
    verifiedAt: daysAgo(4),
    distanceKm: 0.8,
    images: [SPOT_PHOTO, SPOT_PHOTO_PULL_UP, SPOT_PHOTO_RINGS],
    status: 'approved',
    ownerId: CURRENT_USER_ID,
  },
  {
    id: 'south-park-calisthenics',
    name: 'South Park Calisthenics',
    coordinate: { latitude: 42.6687, longitude: 23.3098 },
    rating: 4.2,
    reviewCount: 9,
    equipment: [
      { name: 'Pull-up', quantity: 3 },
      { name: 'Dips', quantity: 2 },
    ],
    condition: 'good',
    description:
      'A quiet corner of South Park with three pull-up bars and two dip stations. Best before nine in the morning — the nearby playground fills up once school lets out.',
    verifiedAt: daysAgo(14),
    distanceKm: 2.1,
    images: [SPOT_PHOTO_PULL_UP, SPOT_PHOTO],
    status: 'approved',
  },
  {
    id: 'borisova-gradina-bars',
    name: 'Borisova Gradina Bars',
    coordinate: { latitude: 42.6873, longitude: 23.3415 },
    rating: 4.9,
    reviewCount: 61,
    equipment: [
      { name: 'Pull-up', quantity: 2 },
      { name: 'Rings' },
      { name: 'Dips' },
      { name: 'Push-up bars', quantity: 2 },
    ],
    condition: 'worn',
    description:
      "The city's classic calisthenics spot: pull-up bars, rings and dip bars in the shade of the old trees. Expect company on weekend mornings — the local crowd trains here most days.",
    verifiedAt: daysAgo(45),
    distanceKm: 3.6,
    images: [SPOT_PHOTO_MONKEY_BARS, SPOT_PHOTO_RINGS, SPOT_PHOTO],
    status: 'approved',
  },
  {
    id: 'vitosha-view-park',
    name: 'Vitosha View Park',
    coordinate: { latitude: 42.6521, longitude: 23.2884 },
    rating: 4.5,
    reviewCount: 17,
    equipment: [{ name: 'Pull-up' }, { name: 'Rings' }, { name: 'Push-up bars' }],
    condition: 'good',
    description:
      'A small workout corner on the way up to Vitosha with a pull-up bar and a set of rings. Basic but solid, and the view over the city makes the warm-up worth it.',
    verifiedAt: daysAgo(8),
    distanceKm: 4.9,
    images: [SPOT_PHOTO_RINGS],
    status: 'approved',
    ownerId: CURRENT_USER_ID,
  },
  {
    id: 'studentski-grad-gym',
    name: 'Studentski Grad Outdoor Gym',
    coordinate: { latitude: 42.6504, longitude: 23.3509 },
    rating: 3.9,
    reviewCount: 42,
    equipment: [
      { name: 'Pull-up', quantity: 4 },
      { name: 'Dips', quantity: 4 },
    ],
    condition: 'damaged',
    description:
      'An outdoor gym between the student blocks with four pull-up stations and four dip stations. Heavily used in the evening, and the lower bars have started to wear through.',
    verifiedAt: daysAgo(120),
    distanceKm: 6.2,
    images: [SPOT_PHOTO, SPOT_PHOTO_MONKEY_BARS],
    status: 'approved',
  },
  {
    id: 'north-park-corner',
    name: 'North Park Fitness Corner',
    coordinate: { latitude: 42.7296, longitude: 23.3233 },
    rating: 4.4,
    reviewCount: 23,
    equipment: [
      { name: 'Pull-up', quantity: 2 },
      { name: 'Monkey bars' },
      { name: 'Sit-up bench' },
    ],
    condition: 'good',
    description:
      'Newly checked fitness corner in North Park with a pull-up bar and a full set of monkey bars. There are lights, so both early morning and late evening sessions work.',
    verifiedAt: daysAgo(2),
    distanceKm: 1.4,
    images: [SPOT_PHOTO],
    status: 'approved',
  },
  {
    id: 'slatina-lights-corner',
    name: 'Slatina Lights Corner',
    coordinate: { latitude: 42.6786, longitude: 23.363 },
    rating: 0,
    reviewCount: 0,
    equipment: [{ name: 'Pull-up', quantity: 2 }, { name: 'Dips' }],
    condition: 'good',
    description:
      'A small fitness corner between the blocks in Slatina with two pull-up bars and a dip station. Lit after dark, but the ground stays muddy for a day after rain.',
    distanceKm: 4.2,
    images: [SPOT_PHOTO_PULL_UP],
    status: 'under_review',
    ownerId: CURRENT_USER_ID,
  },
  {
    id: 'mladost-bars',
    name: 'Mladost Bars',
    coordinate: { latitude: 42.6485, longitude: 23.3785 },
    rating: 0,
    reviewCount: 0,
    equipment: [{ name: 'Pull-up' }, { name: 'Ladder' }],
    condition: 'good',
    description:
      'Pull-up bars and a ladder wall next to the sports hall in Mladost. The paint is fresh and the bars are solid.',
    distanceKm: 6.8,
    images: [SPOT_PHOTO],
    status: 'rejected',
    ownerId: CURRENT_USER_ID,
  },
  {
    id: 'zaimov-park-bars',
    name: 'Zaimov Park Bars',
    coordinate: { latitude: 42.6907, longitude: 23.336 },
    rating: 3.8,
    reviewCount: 14,
    equipment: [{ name: 'Pull-up', quantity: 2 }, { name: 'Rings' }],
    condition: 'worn',
    description:
      'A classic set of bars in Zaimov Park, closed while the park is renovated. The equipment was worn before the works began.',
    verifiedAt: daysAgo(300),
    distanceKm: 2.4,
    images: [SPOT_PHOTO_RINGS],
    status: 'closed',
    ownerId: CURRENT_USER_ID,
  },
];
