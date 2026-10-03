/**
 * Shared vocabulary: the words more than one screen uses, plus the domain labels whose logic
 * lives in a formatter or a badge (condition, moderation status, verification, rating).
 *
 * Keys are English and stable; values are the Bulgarian the app ships with. Another locale
 * later is another module with the same keys, merged the same way, not a rewrite of call sites.
 */
export const COMMON = {
  'common.appName': 'Лостове Наблизо',
  'common.back': 'Назад',
  'common.close': 'Затвори',
  'common.cancel': 'Отказ',
  'common.done': 'Готово',
  'common.continue': 'Продължи',
  'common.viewAll': 'Виж всички',
  'common.tryAgain': 'Опитай отново',
  'common.search': 'Търсене',
  'common.clearSearch': 'Изчисти търсенето',
  'common.loading': 'Зареждане',
  'common.photo': 'Снимка',
  'common.removePhoto': 'Премахни снимката',
  'common.errorTitle': 'Нещо се обърка',
  'common.errorDescription': 'Опитай отново след малко.',
  'common.offline': 'Няма връзка. Показваме последно заредените данни.',

  'nav.nearby': 'Наблизо',
  'nav.favorites': 'Любими',
  'nav.addSpot': 'Добави',
  'nav.profile': 'Профил',
  'nav.addSpotLabel': 'Добави място',

  'equipment.quantity': 'количество {count}',
  'equipment.pullUp': 'Набиране',
  'equipment.dips': 'Успоредка',
  'equipment.rings': 'Халки',
  'equipment.monkeyBars': 'Маймунки',
  'equipment.ladder': 'Стълба',
  'equipment.sitUpBench': 'Коремна пейка',
  'equipment.pushUpBars': 'Опора за лицеви',

  'condition.title': 'Състояние',
  'condition.good': 'Добро',
  'condition.worn': 'Износено',
  'condition.damaged': 'Повредено',
  'condition.goodLong': 'в добро състояние',
  'condition.wornLong': 'износено',
  'condition.damagedLong': 'повредено',
  'condition.accessibility': 'Състояние: {value}',

  'status.under_review': 'В очакване на преглед',
  'status.approved': 'Одобрено',
  'status.rejected': 'Отхвърлено',
  'status.closed': 'Затворено',
  'status.underReviewViewing':
    'Само ти виждаш това място в момента. Ще се появи в „Наблизо“, след като модератор го одобри.',
  'status.rejectedViewing':
    'Модератор не одобри това място. Редактирай го, за да отстраниш проблемите, и го изпрати отново.',
  'status.closedViewing': 'Това място е затворено и вече не се показва в приложението.',
  'status.approvedEditing':
    'Запазването изпраща мястото за преглед отново. Докато модератор не одобри промените, то няма да се показва в „Наблизо“.',
  'status.underReviewEditing':
    'Това място още чака одобрение. Запазването го оставя в опашката за преглед.',
  'status.rejectedEditing': 'Запазването изпраща мястото за преглед отново.',
  'status.closedEditing': 'Това място е затворено и вече не може да се редактира.',

  'verification.today': 'Потвърдено днес',
  'verification.day.one': 'Потвърдено преди 1 ден',
  'verification.day.few': 'Потвърдено преди {count} дни',
  'verification.week.one': 'Потвърдено преди 1 седмица',
  'verification.week.few': 'Потвърдено преди {count} седмици',
  'verification.month.one': 'Потвърдено преди 1 месец',
  'verification.month.few': 'Потвърдено преди {count} месеца',
  'verification.year.one': 'Потвърдено преди 1 година',
  'verification.year.few': 'Потвърдено преди {count} години',
  'verification.unknown': 'Датата на потвърждаване е неизвестна',
  'verification.source.import': 'от OpenStreetMap',
  'verification.source.moderator': 'от модератор',
  'verification.source.user': 'от общността',
  'verification.confirmations.one': '1 потвърждение от общността',
  'verification.confirmations.few': '{count} потвърждения от общността',

  'rating.label': 'Оценка {value} от {max}',
  'rating.labelWithCount': 'Оценка {value} от {max}, {count}',
  'rating.select': 'Оцени с {value} от {max}',
  'rating.review.one': '{count} отзив',
  'rating.review.few': '{count} отзива',

  'validation.nameRequired': 'Въведи име на мястото.',
  'validation.nameMin': 'Използвай поне {count} символа.',
  'validation.descriptionRequired': 'Опиши мястото, за да знаят другите какво да очакват.',
  'validation.descriptionMin': 'Използвай поне {count} символа.',
  'validation.equipmentRequired': 'Избери поне един уред.',
  'validation.photosRequired': 'Добави поне една снимка на мястото.',
  'validation.locationRequired': 'Засечи локацията, преди да продължиш.',

  'common.profilePhoto': 'Профилна снимка',
} satisfies Record<string, string>;
