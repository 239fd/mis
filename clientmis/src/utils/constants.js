export const ROLES = {
  ADMIN: 'ADMIN',
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  MANAGER: 'MANAGER',
};

export const ROLE_LABELS = {
  ADMIN: 'Администратор',
  PATIENT: 'Пациент',
  DOCTOR: 'Врач',
  RECEPTIONIST: 'Сотрудник регистратуры',
  MANAGER: 'Руководитель',
};

export const APPOINTMENT_STATUSES = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
};

export const STATUS_LABELS = {
  WAITING: 'Ожидание',
  IN_PROGRESS: 'На приёме',
  COMPLETED: 'Завершено',
  NO_SHOW: 'Неявка',
  CANCELLED: 'Отменено',
  RESCHEDULED: 'Перенесено',
};

export const STATUS_COLORS = {
  WAITING: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  NO_SHOW: 'error',
  CANCELLED: 'default',
  RESCHEDULED: 'secondary',
};

export const SOURCE_LABELS = {
  ONLINE: 'Онлайн',
  PHONE: 'Телефон',
  WALK_IN: 'Живая очередь',
};

export const SOURCE_COLORS = {
  ONLINE: 'primary',
  PHONE: 'secondary',
  WALK_IN: 'info',
};

export const RELATIONSHIP_LABELS = {
  SELF: 'Я сам(а)',
  CHILD: 'Ребёнок',
  SPOUSE: 'Супруг(а)',
  PARENT: 'Родитель',
  RELATIVE: 'Родственник',
};

export const GENDER_LABELS = {
  MALE: 'Мужской',
  FEMALE: 'Женский',
};

export const EXCEPTION_TYPE_LABELS = {
  VACATION: 'Отпуск',
  SICK_LEAVE: 'Больничный',
  DAY_OFF: 'Выходной',
  DISMISSAL: 'Увольнение',
  OTHER: 'Другое',
};

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Понедельник', short: 'Пн' },
  { value: 2, label: 'Вторник', short: 'Вт' },
  { value: 3, label: 'Среда', short: 'Ср' },
  { value: 4, label: 'Четверг', short: 'Чт' },
  { value: 5, label: 'Пятница', short: 'Пт' },
  { value: 6, label: 'Суббота', short: 'Сб' },
  { value: 7, label: 'Воскресенье', short: 'Вс' },
];

export const DAY_OF_WEEK_LABELS = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  7: 'Воскресенье',
};

export const FIELD_WIDTHS = {
  small: 200,
  medium: 300,
  large: 400,
  full: '100%',
};

export const FORM_FIELD_SX = {
  width: 300,
  minWidth: 300,
  maxWidth: 300,
};

