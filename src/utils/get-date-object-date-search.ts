export function GetDateObjectDateSearch(stringDate: string) {
  const localDateReplace = stringDate.replaceAll('/', '-');
  const year = localDateReplace.slice(6, 11);
  const month = localDateReplace.slice(3, 5);
  const day = localDateReplace.slice(0, 2);

  const localDateForeignFormat = `${year}-${month}-${day}`;

  const initialDate = new Date(localDateForeignFormat);
  initialDate.setHours(0, 0, 0, 0);

  const finalDate = new Date(localDateForeignFormat);
  finalDate.setHours(0, 0, 0, 0);

  finalDate.setDate(finalDate.getDate() + 1);

  return [initialDate, finalDate];
}
