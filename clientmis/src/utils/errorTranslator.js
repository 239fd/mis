const ERROR_TRANSLATIONS = {
  'Invalid login or password': 'Неверный логин или пароль',
  'Invalid credentials': 'Неверные учётные данные',
  'User not found': 'Пользователь не найден',
  'User is disabled': 'Пользователь деактивирован',
  'User is locked': 'Пользователь заблокирован',
  'Account is disabled': 'Аккаунт деактивирован',
  'Account is locked': 'Аккаунт заблокирован',
  'Token expired': 'Сессия истекла, войдите снова',
  'Invalid token': 'Недействительный токен',
  'Access denied': 'Доступ запрещён',
  'Unauthorized': 'Необходима авторизация',
  'Forbidden': 'Доступ запрещён',
  'Login already exists': 'Логин уже занят',
  'Email already exists': 'Email уже используется',
  'Phone already exists': 'Телефон уже используется',
  'Password too short': 'Пароль слишком короткий',
  'Password too weak': 'Пароль слишком простой',
  'Patient not found': 'Пациент не найден',
  'Patient already exists': 'Пациент уже существует',
  'Passport already exists': 'Пациент с таким паспортом уже существует',
  'User already has a patient with SELF relationship': 'У вас уже есть пациент "Я сам(а)". Можно добавить только одного.',
  'Only one SELF is allowed per user': 'Можно добавить только одного пациента "Я сам(а)"',
  'Employee not found': 'Сотрудник не найден',
  'Employee already exists': 'Сотрудник уже существует',
  'Appointment not found': 'Запись не найдена',
  'Slot is not available': 'Выбранное время недоступно',
  'Time slot is already booked': 'Это время уже занято',
  'Cannot cancel appointment': 'Невозможно отменить запись',
  'Cannot modify past appointment': 'Нельзя изменить прошедшую запись',
  'Appointment time has passed': 'Время записи уже прошло',
  'Schedule not found': 'Расписание не найдено',
  'Schedule conflict': 'Конфликт расписания',
  'No available slots': 'Нет свободных слотов',
  'Service not found': 'Услуга не найдена',
  'Service is inactive': 'Услуга неактивна',
  'Specialty not found': 'Специальность не найдена',
  'Validation failed': 'Ошибка валидации',
  'Required field is missing': 'Не заполнено обязательное поле',
  'Invalid format': 'Неверный формат',
  'Invalid date': 'Неверная дата',
  'Invalid email': 'Неверный email',
  'Invalid phone': 'Неверный номер телефона',
  'Not found': 'Не найдено',
  'Bad request': 'Неверный запрос',
  'Internal server error': 'Внутренняя ошибка сервера',
  'Service unavailable': 'Сервис недоступен',
  'Connection refused': 'Нет соединения с сервером',
  'Network error': 'Ошибка сети',
  'Request timeout': 'Превышено время ожидания',
};

export const translateError = (message) => {
  if (!message) return 'Произошла ошибка';

  if (ERROR_TRANSLATIONS[message]) {
    return ERROR_TRANSLATIONS[message];
  }

  for (const [key, value] of Object.entries(ERROR_TRANSLATIONS)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  if (/^[a-zA-Z\s]+$/.test(message)) {
    return 'Произошла ошибка';
  }

  return message;
};

export const getErrorMessage = (error, defaultMessage = 'Произошла ошибка') => {
  if (!error) return defaultMessage;

  const message = error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || defaultMessage;

  return translateError(message);
};
