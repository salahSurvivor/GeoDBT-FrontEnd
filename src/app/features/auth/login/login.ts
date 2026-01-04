import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthServiceService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterLink, Router } from "@angular/router";

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ToastModule, RouterLink ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  compteData: any = { email: '', password: '' };;
  loading = false;
  subscriptions: Subscription[] = [];
  data: any;
  passwordFieldType: string = 'password';
  passwordVerifyFieldType: string = 'password';

  constructor(
    private authService: AuthServiceService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router
  ) { }

  submit(form: any) {
  if (form.invalid) return;

  this.loading = true;

  this.authService.login(this.compteData).subscribe({
    next: (res: { token: string }) => {
      localStorage.setItem('token', res.token);
      this.loading = false;
      this.router.navigate(['/dashboard']);
    },
    error: (err: any) => {
      this.loading = false;
      console.error(err);
      alert('Email ou mot de passe incorrect');
    }
  });
}

  togglePassword() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password'; 
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
