import { Injectable } from '@angular/core';

interface AuthSession {
  email: string;
  employeeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly authStorageKey = 'skyassist.auth';

  private readonly demoCredentials = {
    email: 'agent@skyassist.com',
    password: 'SkyAssist123',
    employeeName: 'SkyAssist Agent'
  };

  login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const isValid =
      normalizedEmail === this.demoCredentials.email.toLowerCase() &&
      password === this.demoCredentials.password;

    if (!isValid) {
      return false;
    }

    const session: AuthSession = {
      email: this.demoCredentials.email,
      employeeName: this.demoCredentials.employeeName
    };

    sessionStorage.setItem(this.authStorageKey, JSON.stringify(session));
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(this.authStorageKey);
  }

  isLoggedIn(): boolean {
    return Boolean(sessionStorage.getItem(this.authStorageKey));
  }

  getEmployeeName(): string {
    const raw = sessionStorage.getItem(this.authStorageKey);
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

  getDemoCredentials(): { email: string; password: string } {
    return {
      email: this.demoCredentials.email,
      password: this.demoCredentials.password
    };
  }
}
