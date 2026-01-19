export function LocalFormatDate(stringDate: string) {
  const localDateReplace = stringDate.replaceAll('/', '-');
  const year = localDateReplace.slice(6, 11);
  const month = localDateReplace.slice(3, 5);
  const day = localDateReplace.slice(0, 2);

  return `${day}-${month}-${year}`;
}
