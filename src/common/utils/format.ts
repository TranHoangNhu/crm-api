const ones = [
  '',
  'một',
  'hai',
  'ba',
  'bốn',
  'năm',
  'sáu',
  'bảy',
  'tám',
  'chín',
];
const teens = [
  'mười',
  'mười một',
  'mười hai',
  'mười ba',
  'mười bốn',
  'mười lăm',
  'mười sáu',
  'mười bảy',
  'mười tám',
  'mười chín',
];

function readGroup(number: number): string {
  const hundred = Math.floor(number / 100);
  const ten = Math.floor((number % 100) / 10);
  const one = number % 10;
  let result = '';

  if (hundred > 0) {
    result += ones[hundred] + ' trăm';
    if (ten === 0 && one > 0) result += ' lẻ';
  }

  if (ten > 1) {
    result += ' ' + ones[ten] + ' mươi';
    if (one === 1) result += ' mốt';
    else if (one === 4) result += ' tư';
    else if (one === 5) result += ' lăm';
    else if (one > 0) result += ' ' + ones[one];
  } else if (ten === 1) {
    result += ' ' + teens[one];
  } else if (one > 0 && hundred > 0) {
    result += ' ' + ones[one];
  } else if (one > 0) {
    result += ones[one];
  }

  return result.trim();
}

export function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'không';
  if (num < 0) return 'âm ' + numberToVietnameseWords(Math.abs(num));

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups: number[] = [];

  let remaining = Math.floor(num);
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      parts.push(readGroup(groups[i]) + (units[i] ? ' ' + units[i] : ''));
    }
  }

  const result = parts.join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function numberToVndText(amount: number): string {
  return numberToVietnameseWords(amount) + ' Việt Nam đồng';
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

export function formatDate(
  date: string | Date,
  format: 'long' | 'short' = 'short',
): string {
  const d = new Date(date);
  if (format === 'long') {
    return `ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
  }
  return d.toLocaleDateString('vi-VN');
}

export function generateQuoteCode(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${dd}${mm}${yyyy}/BG/${random}`;
}

export function generateContractNumber(
  partyAShort: string,
  partyBShort: string,
): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}${mm}${yyyy}/HĐDV/${partyAShort} - ${partyBShort}`;
}

export function generateShareToken(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 12);
}
