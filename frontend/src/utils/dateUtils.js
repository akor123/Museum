import moment from 'moment';

export const formatDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return null;
  return moment(dateString).format(format);
};

export const parseDate = (dateString) => {
  if (!dateString) return null;
  return moment(dateString);
};

export const isValidDate = (dateString) => {
  return moment(dateString, 'YYYY-MM-DD', true).isValid();
};