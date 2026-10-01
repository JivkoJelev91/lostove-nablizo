import type { SpotReview } from '@/features/spots/types';
import { daysAgo } from '@/utils/dates';

/**
 * Mock reviews so every spot page has something to read. The dates are relative to now so the
 * wording never drifts; the authors and the text are invented.
 *
 * `Александър Иванов` is the mock athlete on the Profile tab, so their reviews are written under that
 * name here. One athlete, one name, wherever the review appears.
 */
export const MOCK_REVIEWS: readonly SpotReview[] = [
  {
    id: 'review-trakia-1',
    spotId: 'trakia-fitness-park',
    authorName: 'Мартин Киров',
    rating: 5,
    text: 'Страхотно място за тренировка. Всичко е добре поддържано и има място за пълна тренировка със собствена тежест, дори когато се напълни.',
    date: daysAgo(12),
  },
  {
    id: 'review-trakia-2',
    spotId: 'trakia-fitness-park',
    authorName: 'Иванка Петрова',
    rating: 5,
    text: 'Обожавам локацията и разнообразието от уреди. Идеално за тренировка на открито — халки и лостове на едно място.',
    date: daysAgo(40),
  },
  {
    id: 'review-trakia-3',
    spotId: 'trakia-fitness-park',
    authorName: 'Александър Иванов',
    rating: 4,
    text: 'Здрави лостове и добра настилка, макар че халките имат нужда от нови каишки. Все още е обичайната ми спирка сутрин.',
    date: daysAgo(9),
  },
  {
    id: 'review-borisova-3',
    spotId: 'borisova-gradina-bars',
    authorName: 'Александър Иванов',
    rating: 5,
    text: 'Любимото ми място за работа с халки. Идвай рано в събота и неделя, ако искаш халките само за теб.',
    date: daysAgo(24),
  },
  {
    id: 'review-south-park-1',
    spotId: 'south-park-calisthenics',
    authorName: 'Елена Стоянова',
    rating: 4,
    text: 'Тихо е сутрин, а лостовете са в добро състояние. Сянката е добре дошла през лятото.',
    date: daysAgo(26),
  },
  {
    id: 'review-south-park-2',
    spotId: 'south-park-calisthenics',
    authorName: 'Георги Димитров',
    rating: 5,
    text: 'Три лоста означават, че рядко чакаш, а земята е равна и чиста.',
    date: daysAgo(5),
  },
  {
    id: 'review-borisova-1',
    spotId: 'borisova-gradina-bars',
    authorName: 'Димитър Иванов',
    rating: 5,
    text: 'Най-доброто място за уличен фитнес в София. Тълпата тук те тласка по-силно от всеки фитнес.',
    date: daysAgo(33),
  },
  {
    id: 'review-borisova-2',
    spotId: 'borisova-gradina-bars',
    authorName: 'Мария Тодорова',
    rating: 4,
    text: 'Класическо място, добре поддържано. В събота сутрин се пълни.',
    date: daysAgo(70),
  },
  {
    id: 'review-vitosha-1',
    spotId: 'vitosha-view-park',
    authorName: 'Стефан Петров',
    rating: 5,
    text: 'Само гледката си заслужава пътуването. Халките са здрави, а лостът е на точната височина.',
    date: daysAgo(18),
  },
  {
    id: 'review-vitosha-2',
    spotId: 'vitosha-view-park',
    authorName: 'Александър Иванов',
    rating: 4,
    text: 'Скромно оборудване, но всичко работи. Носи си креда през лятото — лостът се хлъзга.',
    date: daysAgo(52),
  },
  {
    id: 'review-studentski-1',
    spotId: 'studentski-grad-gym',
    authorName: 'Виктор Христов',
    rating: 3,
    text: 'Много уреди, но няколко от долните лостове са износени и се клатят. Стават за кофички, но не толкова за експлозивна работа.',
    date: daysAgo(30),
  },
  {
    id: 'review-studentski-2',
    spotId: 'studentski-grad-gym',
    authorName: 'Йоана Маринова',
    rating: 4,
    text: 'Удобно, ако живееш наблизо, а вечер е оживено. Състоянието варира от уред до уред.',
    date: daysAgo(15),
  },
  {
    id: 'review-north-park-1',
    spotId: 'north-park-corner',
    authorName: 'Петър Ангелов',
    rating: 5,
    text: 'Наскоро поддържано, а маймунските лостове са чудесни за хват. Осветлението е хубава добавка.',
    date: daysAgo(3),
  },
  {
    id: 'review-north-park-2',
    spotId: 'north-park-corner',
    authorName: 'Калина Василева',
    rating: 4,
    text: 'Чисто, тихо и в добро състояние. Пейка наблизо би го направила идеално.',
    date: daysAgo(21),
  },
];
