import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly router: Router
  ) {}

  get employeeName(): string {
    return this.authService.getEmployeeName();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
