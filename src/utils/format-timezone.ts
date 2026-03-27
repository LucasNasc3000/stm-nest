import { formatInTimeZone } from 'date-fns-tz';

export const Formatter = (date: Date) =>
  formatInTimeZone(date, 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ss");
