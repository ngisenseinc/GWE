import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':
    case 'in':
    case 'received':
    case 'active':
      return 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20';
    case 'pending':
    case 'low':
    case 'sent':
    case 'confirmed':
      return 'bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20';
    case 'refund':
    case 'out':
    case 'overdue':
      return 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20';
    case 'partial_refund':
    case 'processing':
      return 'bg-[#3498DB]/10 text-[#3498DB] border-[#3498DB]/20';
    default:
      return 'bg-[#8A90A8]/10 text-[#8A90A8] border-[#8A90A8]/20';
  }
}
