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
  },
];
