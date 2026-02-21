import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export const formatDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('DD.MM.YYYY');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const formatTime = (time) => {
  if (!time) return '';
  if (time.includes('T')) {
    return time.slice(11, 16);
  }
  return time.slice(0, 5);
};

export const formatFullName = (lastName, firstName, middleName) => {
  const parts = [lastName, firstName, middleName].filter(Boolean);
  return parts.join(' ');
};

export const formatShortName = (lastName, firstName, middleName) => {
  let result = lastName || '';
  if (firstName) {
    result += ` ${firstName.charAt(0)}.`;
  }
  if (middleName) {
    result += ` ${middleName.charAt(0)}.`;
  }
  return result;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+${cleaned.charAt(0)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }
  return phone;
};

export const formatPassport = (series, number) => {
  if (!series || !number) return '';
  return `${series} ${number}`;
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  return dayjs().diff(dayjs(birthDate), 'year');
};

export const formatDuration = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${mins} мин`;
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(decimals)}%`;
};

