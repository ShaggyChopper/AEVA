/**
 * Calculates the start and end dates of a "financial month"
 * which runs from the 26th of one month to the 25th of the next.
 * This aligns with a payday on the 25th of the month.
 * @param {Date} [forDate=new Date()] The date to determine the financial month for.
 * @returns {{startDate: string, endDate: string}} The start and end dates as 'YYYY-MM-DD' strings.
 */
export const getFinancialMonthRange = (forDate: Date = new Date()): { startDate: string; endDate: string } => {
  const year = forDate.getFullYear();
  const month = forDate.getMonth();
  const day = forDate.getDate();

  let startYear, startMonth, endYear, endMonth;

  // The financial period ends on the 25th.
  // If today is on or before the 25th, the period ends this month (e.g., July 15th is in the period ending July 25th).
  // If today is after the 25th, the period ends next month (e.g., July 26th is in the period ending August 25th).
  if (day <= 25) {
    endYear = year;
    endMonth = month; // e.g., for July 15th, end month is July.
    // The start month is the previous month.
    startYear = month === 0 ? year - 1 : year;
    startMonth = month === 0 ? 11 : month - 1;
  } else {
    // e.g., for July 26th, end month is August.
    endYear = month === 11 ? year + 1 : year;
    endMonth = month === 11 ? 0 : month + 1;
    // The start month is the current month.
    startYear = year;
    startMonth = month;
  }

  // Using UTC to avoid timezone shifts when creating dates from parts
  // Period starts on the 26th of the start month.
  const startDate = new Date(Date.UTC(startYear, startMonth, 26));
  // Period ends on the 25th of the end month.
  const endDate = new Date(Date.UTC(endYear, endMonth, 25));

  // toISOString() returns YYYY-MM-DDTHH:mm:ss.sssZ, we just want the date part.
  const toDateString = (d: Date) => d.toISOString().split('T')[0];
  
  return {
    startDate: toDateString(startDate),
    endDate: toDateString(endDate),
  };
};
