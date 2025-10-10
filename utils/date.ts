/**
 * Calculates the start and end dates of a "financial month"
 * which runs from the 25th of one month to the 24th of the next.
 * @param {Date} [forDate=new Date()] The date to determine the financial month for.
 * @returns {{startDate: string, endDate: string}} The start and end dates as 'YYYY-MM-DD' strings.
 */
export const getFinancialMonthRange = (forDate: Date = new Date()): { startDate: string; endDate: string } => {
  const year = forDate.getFullYear();
  const month = forDate.getMonth();
  const day = forDate.getDate();

  let startYear, startMonth, endYear, endMonth;

  if (day >= 25) {
    // Current date is in the financial month that starts this month.
    // e.g., July 26th is in the July 25th - August 24th period.
    startYear = year;
    startMonth = month; // month is 0-indexed
    endYear = month === 11 ? year + 1 : year;
    endMonth = month === 11 ? 0 : month + 1;
  } else {
    // Current date is in the financial month that started last month.
    // e.g., July 15th is in the June 25th - July 24th period.
    startYear = month === 0 ? year - 1 : year;
    startMonth = month === 0 ? 11 : month - 1;
    endYear = year;
    endMonth = month;
  }

  // Using UTC to avoid timezone shifts when creating dates from parts
  const startDate = new Date(Date.UTC(startYear, startMonth, 25));
  const endDate = new Date(Date.UTC(endYear, endMonth, 24));

  // toISOString() returns YYYY-MM-DDTHH:mm:ss.sssZ, we just want the date part.
  const toDateString = (d: Date) => d.toISOString().split('T')[0];
  
  return {
    startDate: toDateString(startDate),
    endDate: toDateString(endDate),
  };
};
