/** The discovery surfaces: the feed, favourites, search and the distance wording. */
export const DISCOVERY = {
  'home.searchPlaceholder': 'Търси места...',
  'home.aroundYou': 'Около теб',
  'home.sortedByDistance': 'Местата са подредени по близост до теб',
  'home.noMatchTitle': 'Няма съвпадение',
  'home.noMatchDescription': 'Няма места с всички избрани уреди.',
  'home.clearFilters': 'Изчисти филтрите',

  'favorites.title': 'Любими',
  'favorites.description': 'Твоите запазени места',
  'favorites.emptyTitle': 'Още няма любими',
  'favorites.emptyDescription': 'Запази места, които искаш да посетиш по-късно.',
  'favorites.explore': 'Разгледай местата',

  'search.title': 'Търси места',
  'search.placeholder': 'Търси места...',
  'search.close': 'Затвори търсенето',
  'search.noResultsTitle': 'Няма намерени места',
  'search.noResultsDescription': 'Нищо не съвпада с „{query}“.',

  'distance.meters': '{distance} м от теб',
  'distance.kilometers': '{distance} км от теб',
  'distance.here': 'Тук, до теб',
  'distance.unknown': ' — няма локация',
} satisfies Record<string, string>;
