/**
 * The privacy policy and the terms of use, as the settings screens render them.
 *
 * Written for the app as it actually is: the data it collects, where it goes, and what a user
 * agrees to. The contact link is a placeholder until a support address exists; the wording does
 * not promise features the app does not have.
 */
export const LEGAL = {
  'legal.updated': 'Последна актуализация: {date}',
  'legal.privacy.title': 'Политика за поверителност',
  'legal.privacy.intro':
    'Тази политика обяснява какви данни събира „Лостове Наблизо“, защо и как ги пазим.',
  'legal.privacy.dataTitle': 'Какви данни събираме',
  'legal.privacy.dataBody':
    'При регистрация: име, имейл и потребителско име. Когато използваш приложението: местата, които добавяш, снимките, отзивите, оценките и докладите, които изпращаш.',
  'legal.privacy.locationTitle': 'Локация',
  'legal.privacy.locationBody':
    'Позицията се чете само в момента, в който добавяш ново място, и само за да се запише къде се намира то. Не следим местоположението ти във фонов режим.',
  'legal.privacy.photosTitle': 'Снимки',
  'legal.privacy.photosBody':
    'Снимките се съхраняват в защитено хранилище и се показват публично към одобрените места. Качвай само свои снимки или такива, които имаш право да споделяш.',
  'legal.privacy.storageTitle': 'Къде се съхраняват данните',
  'legal.privacy.storageBody':
    'Данните се пазят в Supabase (база данни и файлово хранилище). Достъпът е ограничен с правила за сигурност на ниво ред, така че всеки вижда само позволеното.',
  'legal.privacy.sharingTitle': 'Споделяне с трети страни',
  'legal.privacy.sharingBody':
    'Не продаваме и не предоставяме личните ти данни на трети страни. Публично видими са само одобрените места, отзивите и потребителското име.',
  'legal.privacy.retentionTitle': 'Съхранение и изтриване',
  'legal.privacy.retentionBody':
    'Данните остават, докато акаунтът съществува. Можеш да поискаш изтриване на акаунта и на съдържанието, което си добавил, като се свържеш с нас.',
  'legal.privacy.contactTitle': 'Контакт',
  'legal.privacy.contactBody': 'За въпроси относно личните ти данни: {contact}',

  'legal.terms.title': 'Условия за ползване',
  'legal.terms.intro':
    'Тези условия уреждат използването на „Лостове Наблизо“. Използвайки приложението, ти ги приемаш.',
  'legal.terms.acceptTitle': 'Приемане на условията',
  'legal.terms.acceptBody':
    'Ако не си съгласен с тези условия, не използвай приложението. За да добавяш места, отзиви и снимки, е нужен акаунт.',
  'legal.terms.contentTitle': 'Твоето съдържание',
  'legal.terms.contentBody':
    'Отговаряш за това, което качваш. Не качвай незаконно съдържание, чужди снимки без разрешение или подвеждаща информация за места.',
  'legal.terms.moderationTitle': 'Модерация',
  'legal.terms.moderationBody':
    'Добавените места се преглеждат, преди да станат публични. Модератор може да отхвърли или премахне съдържание, което нарушава тези условия.',
  'legal.terms.conductTitle': 'Поведение',
  'legal.terms.conductBody':
    'Не злоупотребявай с докладите и не спами. Фалшивите доклади и злоупотребата могат да доведат до ограничаване на акаунта.',
  'legal.terms.liabilityTitle': 'Отговорност',
  'legal.terms.liabilityBody':
    'Приложението се предоставя „както е“. Информацията за местата идва от общността и може да не е точна — проверявай на място, преди да разчиташ на нея.',
  'legal.terms.changesTitle': 'Промени в условията',
  'legal.terms.changesBody':
    'Условията може да се променят. Продължавайки да използваш приложението след промяна, приемаш новата версия.',
  'legal.terms.contactTitle': 'Контакт',
  'legal.terms.contactBody': 'За въпроси и сигнали: {contact}',
} satisfies Record<string, string>;
