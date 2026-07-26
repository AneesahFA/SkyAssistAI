import { Injectable } from '@angular/core';
import { InputSecurityService } from './input-security.service';
import { SafeStorageService } from './safe-storage.service';

interface AuthSession {
  email: string;
  employeeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly authStorageKey = 'skyassist.auth';
  private readonly emailMaxLength = 120;
  private readonly passwordMaxLength = 128;

  private readonly demoCredentials = {
    email: 'agent@skyassist.com',
    password: 'SkyAssist123',
    employeeName: 'SkyAssist Agent'
  };

  constructor(
    private readonly inputSecurityService: InputSecurityService,
    private readonly safeStorageService: SafeStorageService
  ) {}

  login(email: string, password: string): boolean {
    const sanitizedEmail = this.inputSecurityService
      .sanitizePlainText(email, this.emailMaxLength)
      .toLowerCase();
    const sanitizedPassword = this.inputSecurityService
      .sanitizePlainText(password, this.passwordMaxLength);

    if (!this.inputSecurityService.isValidEmail(sanitizedEmail)) {
      return false;
    }

    const isValid =
      sanitizedEmail === this.demoCredentials.email.toLowerCase() &&
      sanitizedPassword === this.demoCredentials.password;

    if (!isValid) {
      return false;
    }

    const session: AuthSession = {
      email: this.demoCredentials.email,
      employeeName: this.demoCredentials.employeeName
    };

    const serialized = JSON.stringify(session);
    const storedInSession = this.safeStorageService.setItem(
      this.authStorageKey,
      serialized,
      'session'
    );

    if (storedInSession) {
      return true;
    }

    return this.safeStorageService.setItem(this.authStorageKey, serialized, 'local');
  }

  logout(): void {
    this.safeStorageService.removeItem(this.authStorageKey, 'session');
    this.safeStorageService.removeItem(this.authStorageKey, 'local');
  }

  isLoggedIn(): boolean {
    return Boolean(this.readRawSession());
  }

  getEmployeeName(): string {
    const raw = this.readRawSession();
    if (!raw) {
      return '';
    }

    try {
      const session = JSON.parse(raw) as AuthSession;
      return session.employeeName || '';
    } catch {
      return '';
    }
  }

  private readRawSession(): string | null {
    const sessionValue = this.safeStorageService.getItem(this.authStorageKey, 'session');
    if (sessionValue) {
      return sessionValue;
    }

    return this.safeStorageService.getItem(this.authStorageKey, 'local');
  }

  getDemoCredentials(): { email: string; password: string } {
    return {
      email: this.demoCredentials.email,
      password: this.demoCredentials.password
    };
  }
}
