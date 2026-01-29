export function ReturnDateAndTimeForeignFormat() {
  const dateObj = new Date();

  const localDate = dateObj.toLocaleString('pt-br', {
    dateStyle: 'short',
  });

  const localHour = dateObj.toLocaleTimeString('pt-br', {
    hourCycle: 'h24',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const localDateReplace = localDate.replaceAll('/', '-');
  const year = localDateReplace.slice(6, 10);
  const month = localDateReplace.slice(3, 5);
  const day = localDateReplace.slice(0, 2);

  const hours = localHour.slice(0, 2);
  const minutes = localHour.slice(3, 5);
  const seconds = localHour.slice(6, 9);

  const hourString = `${hours}:${minutes}:${seconds}`;
  const fullDate = `${year}-${month}-${day}`;

  return [fullDate, hourString];
}
