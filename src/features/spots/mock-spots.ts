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
    name: 'Фитнес парк „Тракия“',
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
      'Фитнес на открито с лостове, успоредки, гимнастически халки и маймунски лостове. Уредите са на гумирана настилка под дърветата, така че може да тренираш и веднага след дъжд.',
    verifiedAt: daysAgo(4),
    distanceKm: 0.8,
    images: [SPOT_PHOTO, SPOT_PHOTO_PULL_UP, SPOT_PHOTO_RINGS],
    status: 'approved',
  },
  {
    id: 'south-park-calisthenics',
    name: 'Уличен фитнес „Южен парк“',
    coordinate: { latitude: 42.6687, longitude: 23.3098 },
    rating: 4.2,
    reviewCount: 9,
    equipment: [
      { name: 'Pull-up', quantity: 3 },
      { name: 'Dips', quantity: 2 },
    ],
    condition: 'good',
    description:
      'Тихо кътче в Южен парк с три лоста и две успоредки. Най-добре е преди девет сутринта — съседната детска площадка се пълни, след като училището свърши.',
    verifiedAt: daysAgo(14),
    distanceKm: 2.1,
    images: [SPOT_PHOTO_PULL_UP, SPOT_PHOTO],
    status: 'approved',
  },
  {
    id: 'borisova-gradina-bars',
    name: 'Лостове „Борисова градина“',
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
      'Класическата градска площадка за уличен фитнес: лостове, халки и успоредки в сянката на старите дървета. В събота и неделя сутрин очаквай компания — местната група тренира тук почти всеки ден.',
    verifiedAt: daysAgo(45),
    distanceKm: 3.6,
    images: [SPOT_PHOTO_MONKEY_BARS, SPOT_PHOTO_RINGS, SPOT_PHOTO],
    status: 'approved',
  },
  {
    id: 'vitosha-view-park',
    name: 'Площадка край Витоша',
    coordinate: { latitude: 42.6521, longitude: 23.2884 },
    rating: 4.5,
    reviewCount: 17,
    equipment: [{ name: 'Pull-up' }, { name: 'Rings' }, { name: 'Push-up bars' }],
    condition: 'good',
    description:
      'Малко кътче за тренировка по пътя нагоре към Витоша с лост и комплект халки. Скромно, но солидно, а гледката към града си заслужава загрявката.',
    verifiedAt: daysAgo(8),
    distanceKm: 4.9,
    images: [SPOT_PHOTO_RINGS],
    status: 'approved',
  },
  {
    id: 'studentski-grad-gym',
    name: 'Фитнес на открито „Студентски град“',
    coordinate: { latitude: 42.6504, longitude: 23.3509 },
    rating: 3.9,
    reviewCount: 42,
    equipment: [
      { name: 'Pull-up', quantity: 4 },
      { name: 'Dips', quantity: 4 },
    ],
    condition: 'damaged',
    description:
      'Фитнес на открито между студентските блокове с четири лоста и четири успоредки. Вечер е претъпкано, а долните лостове вече започват да се износват.',
    verifiedAt: daysAgo(120),
    distanceKm: 6.2,
    images: [SPOT_PHOTO, SPOT_PHOTO_MONKEY_BARS],
    status: 'approved',
  },
  {
    id: 'north-park-corner',
    name: 'Фитнес кът „Северен парк“',
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
      'Наскоро проверено фитнес кътче в Северен парк с лост и пълен комплект маймунски лостове. Има осветление, така че стават и ранни сутрешни, и късни вечерни тренировки.',
    verifiedAt: daysAgo(2),
    distanceKm: 1.4,
    images: [SPOT_PHOTO],
    status: 'approved',
  },
  {
    id: 'slatina-lights-corner',
    name: 'Кът „Слатина“',
    coordinate: { latitude: 42.6786, longitude: 23.363 },
    rating: 0,
    reviewCount: 0,
    equipment: [{ name: 'Pull-up', quantity: 2 }, { name: 'Dips' }],
    condition: 'good',
    description:
      'Малко фитнес кътче между блоковете в Слатина с два лоста и успоредка. Осветено е и след мръкване, но земята остава кална един ден след дъжд.',
    distanceKm: 4.2,
    images: [SPOT_PHOTO_PULL_UP],
    status: 'under_review',
  },
  {
    id: 'mladost-bars',
    name: 'Лостове „Младост“',
    coordinate: { latitude: 42.6485, longitude: 23.3785 },
    rating: 0,
    reviewCount: 0,
    equipment: [{ name: 'Pull-up' }, { name: 'Ladder' }],
    condition: 'good',
    description:
      'Лостове и гимнастическа стълба до спортната зала в Младост. Боята е прясна, а лостовете са здрави.',
    distanceKm: 6.8,
    images: [SPOT_PHOTO],
    status: 'rejected',
  },
  {
    id: 'zaimov-park-bars',
    name: 'Лостове „Заимов“',
    coordinate: { latitude: 42.6907, longitude: 23.336 },
    rating: 3.8,
    reviewCount: 14,
    equipment: [{ name: 'Pull-up', quantity: 2 }, { name: 'Rings' }],
    condition: 'worn',
    description:
      'Класически лостове в парк „Заимов“, затворени заради ремонта на парка. Уредите бяха износени още преди да започнат работите.',
    verifiedAt: daysAgo(300),
    distanceKm: 2.4,
    images: [SPOT_PHOTO_RINGS],
    status: 'closed',
  },
];
