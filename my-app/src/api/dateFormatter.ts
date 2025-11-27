export const formatDateForBackend = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Проверка валидности даты
  if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  const result = `${day}.${month}.${year}`;
  console.log('📅 Date formatted:', { input: dateString, output: result });
  
  return result;
};
  
  export const formatDateForFrontend = (dateString: string): string => {
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
  };