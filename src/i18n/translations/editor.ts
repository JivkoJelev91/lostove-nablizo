/** The Add Spot wizard, the Edit Spot form, and the photo and location controls they share. */
export const EDITOR = {
  'editor.title': 'Добави място',
  'editor.stepOf': '{step} / {total}',

  'location.title': 'Къде е мястото?',
  'location.hint': 'Застани на мястото, за да засече телефонът ти правилната позиция.',
  'location.capture': 'Използвай текущата ми локация',
  'location.capturing': 'Засичаме локацията...',
  'location.captured': 'Локацията е засечена',
  'location.permissionDenied':
    'Разреши достъп до локацията за „Лостове Наблизо“ в настройките на телефона и опитай отново.',
  'location.failedPosition':
    'Позицията ти не можа да бъде прочетена. Отдалечи се от сгради и опитай отново.',

  'details.title': 'Разкажи ни за мястото',
  'details.name': 'Име',
  'details.namePlaceholder': 'напр. Фитнес парк Тракия',
  'details.description': 'Описание',
  'details.descriptionPlaceholder': 'Открита фитнес площадка с лостове, успоредки и халки...',

  'equipmentStep.title': 'Какви уреди има?',
  'equipmentStep.tapToAdd': 'Докосни, за да добавиш',
  'equipmentStep.increase': 'Увеличи количеството на {name}',
  'equipmentStep.decrease': 'Намали количеството на {name}',
  'equipmentStep.addHint': 'Добавя този уред',
  'equipmentStep.removeHint': 'Премахва този уред',

  'photosStep.title': 'Добави снимки',
  'photosStep.description': 'Покажи как изглежда мястото.',
  'photosStep.camera': 'Снимай',
  'photosStep.gallery': 'Галерия',
  'photosStep.cameraDenied': 'За да снимаш, разреши достъп до камерата от настройките на телефона.',
  'photosStep.pickerFailed': 'Снимката не можа да се добави. Опитай отново.',
  'photosStep.limit': 'До {count} снимки.',
  'photosStep.label': 'Снимка {index}',
  'photosStep.section': 'Снимки',
  'photosStep.coverPhoto': 'Снимка на {name}',

  'reviewStep.title': 'Прегледай мястото',
  'reviewStep.equipment': 'Уреди',
  'reviewStep.location': 'Локация',
  'reviewStep.notCaptured': 'Не е засечена',

  'submit.add': 'Добави мястото',
  'submit.submitting': 'Добавяме мястото...',
  'submit.uploading': 'Качваме снимките... {done} / {total}',
  'submit.addFailed': 'Мястото не се запази. Провери връзката и опитай отново.',
  'submit.saveFailed': 'Запазването не завърши. Провери връзката и опитай отново.',
  'submit.photosFailed':
    'Промените са запазени, но някои снимки не се качиха. Натисни „Запази“ отново.',
  'submit.photoFailures': 'Някои снимки не се качиха. Добави ги от редакцията на мястото.',
  'submit.changes': 'Запази промените',
  'submit.savingChanges': 'Запазваме промените...',
  'submit.changesTitle': 'Промените са изпратени',
  'submit.changesDescription':
    'Промените ти чакат преглед и ще се появят в мястото, след като бъдат одобрени.',
  'submit.discardTitle': 'Да отхвърля ли промените?',
  'submit.discardDescription': 'Промените по това място ще бъдат загубени.',
  'submit.keepEditing': 'Продължи редакцията',
  'submit.discard': 'Отхвърли',
  'submit.editTitle': 'Редактирай мястото',

  'success.title': 'Мястото е изпратено',
  'success.message':
    'Благодарим ти! {name} е в очакване на одобрение и остава в профила ти, докато модератор го публикува.',
  'success.viewSpot': 'Виж мястото',
  'success.addAnother': 'Добави още едно',
} satisfies Record<string, string>;
