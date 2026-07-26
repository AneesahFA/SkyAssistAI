import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { InputSecurityService } from '../../services/input-security.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  readonly emailMaxLength = 120;
  readonly passwordMaxLength = 128;

  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthenticationService,
    private readonly router: Router,
    private readonly inputSecurityService: InputSecurityService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  get demoCredentials(): { email: string; password: string } {
    return this.authService.getDemoCredentials();
  }

  submit(): void {
    this.errorMessage = '';

    const sanitizedEmail = this.inputSecurityService
      .sanitizePlainText(this.email, this.emailMaxLength)
      .toLowerCase();
    const sanitizedPassword = this.inputSecurityService
      .sanitizePlainText(this.password, this.passwordMaxLength);

    this.email = sanitizedEmail;
    this.password = sanitizedPassword;

    if (
      !this.inputSecurityService.isNotBlank(sanitizedEmail) ||
      !this.inputSecurityService.isNotBlank(sanitizedPassword)
    ) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    if (!this.inputSecurityService.isValidEmail(sanitizedEmail)) {
      this.errorMessage = 'Please enter a valid employee email address.';
      return;
    }

    const isValid = this.authService.login(sanitizedEmail, sanitizedPassword);
    if (!isValid) {
      this.errorMessage = 'Invalid demo credentials. Please use the values shown below.';
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}
