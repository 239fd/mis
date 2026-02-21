export const required = (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return 'Обязательное поле';
  }
  return null;
};

export const minLength = (min) => (value) => {
  if (value && value.length < min) {
    return `Минимум ${min} символов`;
  }
  return null;
};

export const maxLength = (max) => (value) => {
  if (value && value.length > max) {
    return `Максимум ${max} символов`;
  }
  return null;
};

export const email = (value) => {
  if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    return 'Некорректный email';
  }
  return null;
};

export const phone = (value) => {
  if (value && !/^\+?[0-9]{10,15}$/.test(value.replace(/\D/g, ''))) {
    return 'Некорректный номер телефона';
  }
  return null;
};

export const passportSeries = (value) => {
  if (value && !/^[A-ZА-Я]{2}$/i.test(value)) {
    return 'Серия паспорта: 2 буквы (например: MP, AB)';
  }
  return null;
};

export const passportNumber = (value) => {
  if (value && !/^\d{7}$/.test(value)) {
    return 'Номер паспорта: 7 цифр';
  }
  return null;
};

export const passwordMatch = (password) => (value) => {
  if (value !== password) {
    return 'Пароли не совпадают';
  }
  return null;
};

export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

