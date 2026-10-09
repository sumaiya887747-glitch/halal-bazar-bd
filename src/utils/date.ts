/**
 * Real order date and time formatter
 * Returns date in clear standard format: "DD-MM-YYYY, hh:mm AM/PM"
 * Example: "04-10-2026, 11:45 AM"
 */
export const formatOrderDateTime = (dateInput?: string | Date): string => {
  const getNowFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${day}-${month}-${year}, ${strHours}:${minutes} ${ampm}`;
  };

  // If empty, or "এইমাত্র", or "Just now"
  if (!dateInput) return getNowFormatted();
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed || trimmed === 'এইমাত্র' || trimmed === 'Just now' || trimmed.includes('এইমাত্র')) {
      return getNowFormatted();
    }

    // If it contains "আজ"
    if (trimmed.includes('আজ')) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const timePart = trimmed.replace(/আজ,?/g, '').trim();
      return `${day}-${month}-${year}${timePart ? `, ${timePart}` : ''}`;
    }

    // If it contains "গতকাল"
    if (trimmed.includes('গতকাল')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const day = String(yesterday.getDate()).padStart(2, '0');
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const year = yesterday.getFullYear();
      const timePart = trimmed.replace(/গতকাল,?/g, '').trim();
      return `${day}-${month}-${year}${timePart ? `, ${timePart}` : ''}`;
    }

    // If it's already in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}/.test(trimmed)) {
      return trimmed;
    }
  }

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return getNowFormatted();
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');
  return `${day}-${month}-${year}, ${strHours}:${minutes} ${ampm}`;
};

/**
 * Parse any date string (ISO, "DD-MM-YYYY, hh:mm AM/PM", "DD/MM/YYYY", etc.) safely into a Date object
 */
export const parseOrderDate = (input?: string | number | Date): Date => {
  if (!input) return new Date();
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? new Date() : input;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  const str = String(input).trim();
  if (!str) return new Date();

  // 1. Try ISO / standard date parsing first
  const standardDate = new Date(str);
  if (!isNaN(standardDate.getTime()) && !/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    return standardDate;
  }

  // 2. Parse "DD-MM-YYYY, hh:mm AM/PM" or "DD/MM/YYYY"
  const match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:,?\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?)?/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
    const year = parseInt(match[3], 10);

    let hours = match[4] ? parseInt(match[4], 10) : 0;
    const minutes = match[5] ? parseInt(match[5], 10) : 0;
    const ampm = match[6] ? match[6].toUpperCase() : undefined;

    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }

    const parsed = new Date(year, month, day, hours, minutes);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
};

/**
 * Format date only: "DD-MM-YYYY"
 */
export const formatOrderDateOnly = (dateInput?: string | Date): string => {
  const d = dateInput instanceof Date ? dateInput : (dateInput ? new Date(dateInput) : new Date());
  if (isNaN(d.getTime())) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${today.getFullYear()}`;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
