import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputSecurityService {
  sanitizePlainText(value: unknown, maxLength: number): string {
    if (typeof value !== 'string') {
      return '';
    }

    const withoutControls = value.replace(/[\u0000-\u001F\u007F]/g, ' ');
    const withoutTags = withoutControls.replace(/<[^>]*>/g, ' ');
    const normalized = withoutTags.replace(/\s+/g, ' ').trim();
    return normalized.slice(0, Math.max(0, maxLength));
  }

  escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  isNotBlank(value: string): boolean {
    return value.trim().length > 0;
  }

  isValidEmail(value: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(value);
  }
}
