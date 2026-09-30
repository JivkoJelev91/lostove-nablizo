import type { SpotReview } from '@/features/spots/types';
import { daysAgo } from '@/utils/dates';

/**
 * Mock reviews so every spot page has something to read. The dates are relative to now so the
 * wording never drifts; the authors and the text are invented.
 */
export const MOCK_REVIEWS: readonly SpotReview[] = [
  {
    id: 'review-trakia-1',
    spotId: 'trakia-fitness-park',
    authorName: 'Martin Kirov',
    rating: 5,
    text: 'Great place for training. Everything is well maintained and there is room for a full bodyweight session even when it gets busy.',
    date: daysAgo(12),
  },
  {
    id: 'review-trakia-2',
    spotId: 'trakia-fitness-park',
    authorName: 'Ivanka Petrova',
    rating: 5,
    text: 'Love the location and the variety of equipment. Perfect for outdoor training with rings and bars in one spot.',
    date: daysAgo(40),
  },
  {
    id: 'review-trakia-3',
    spotId: 'trakia-fitness-park',
    authorName: 'Nikolay Georgiev',
    rating: 4,
    text: 'Solid bars and a good surface, though the rings could use new straps. Still my usual morning stop.',
    date: daysAgo(9),
  },
  {
    id: 'review-south-park-1',
    spotId: 'south-park-calisthenics',
    authorName: 'Elena Stoyanova',
    rating: 4,
    text: 'Quiet in the mornings and the bars are in good shape. The shade is welcome in summer.',
    date: daysAgo(26),
  },
  {
    id: 'review-south-park-2',
    spotId: 'south-park-calisthenics',
    authorName: 'Georgi Dimitrov',
    rating: 5,
    text: 'Three pull-up bars means you rarely wait, and the ground is flat and clean.',
    date: daysAgo(5),
  },
  {
    id: 'review-borisova-1',
    spotId: 'borisova-gradina-bars',
    authorName: 'Dimitar Ivanov',
    rating: 5,
    text: 'Best calisthenics spot in Sofia. The crowd here pushes you harder than any gym.',
    date: daysAgo(33),
  },
  {
    id: 'review-borisova-2',
    spotId: 'borisova-gradina-bars',
    authorName: 'Maria Todorova',
    rating: 4,
    text: 'Classic spot, well kept. It gets crowded on Saturday mornings.',
    date: daysAgo(70),
  },
  {
    id: 'review-vitosha-1',
    spotId: 'vitosha-view-park',
    authorName: 'Stefan Petrov',
    rating: 5,
    text: 'The view alone is worth the trip. The rings are solid and the bar is the right height.',
    date: daysAgo(18),
  },
  {
    id: 'review-vitosha-2',
    spotId: 'vitosha-view-park',
    authorName: 'Anna Koleva',
    rating: 4,
    text: 'Basic setup but everything works. Bring chalk in the summer, the bar gets slippery.',
    date: daysAgo(52),
  },
  {
    id: 'review-studentski-1',
    spotId: 'studentski-grad-gym',
    authorName: 'Viktor Hristov',
    rating: 3,
    text: 'Lots of stations, but a few of the lower bars are worn and wobble. Fine for dips, less for explosive work.',
    date: daysAgo(30),
  },
  {
    id: 'review-studentski-2',
    spotId: 'studentski-grad-gym',
    authorName: 'Yoana Marinova',
    rating: 4,
    text: 'Convenient if you live nearby and it is lively in the evenings. Condition varies by station.',
    date: daysAgo(15),
  },
  {
    id: 'review-north-park-1',
    spotId: 'north-park-corner',
    authorName: 'Petar Angelov',
    rating: 5,
    text: 'Freshly maintained and the monkey bars are great for grip work. The lights are a nice touch.',
    date: daysAgo(3),
  },
  {
    id: 'review-north-park-2',
    spotId: 'north-park-corner',
    authorName: 'Kalina Vasileva',
    rating: 4,
    text: 'Clean, quiet and in good condition. A bench nearby would make it perfect.',
    date: daysAgo(21),
  },
];
