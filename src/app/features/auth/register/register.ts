import { Component, ChangeDetectorRef, OnDestroy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthServiceService } from '../../../core/services/auth.service';
import { CompanyComptes } from '../../../core/models/companyAuth.model';
import { MemberComptes } from '../../../core/models/memberAuth.model';
import { RegisterMember } from '../../../core/models/register-member.model';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms'; 
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnDestroy {
  companyInfo: CompanyComptes = { entrepriseNom: '', email: '', telephone: '', adresse: '', password: '' };
  memberInfo : MemberComptes = { firstName: '', lastName: '', email: '', telephone : '', password: ''};

  inviteToken: string = ''; //for signup member from company invitation
  passwordVerify!: string;
  loading = false;
  subscriptions: Subscription[] = [];
  data: any;
  passwordFieldType: string = 'password';
  passwordVerifyFieldType: string = 'password';

  constructor(
    private authService: AuthServiceService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit() {
  }

  registerType: 'company' | 'member' = 'company';

  submit(form: NgForm) {
    if (form.invalid) return;

    this.loading = true;

    let subscription: Subscription;

    if (this.registerType === 'company') {
      subscription = this.authService
        .registerCompany(this.companyInfo)
        .subscribe(this.handleResponse(form));
    } else {
      const payload: RegisterMember = {
        ...this.memberInfo,
        inviteToken: this.inviteToken
      };

      subscription = this.authService
        .registerMember(payload)
        .subscribe(this.handleResponse(form));
    }
    this.subscriptions.push(subscription);
  }


  togglePassword(field: 'password' | 'verify') {
    if (field === 'password') {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    } else {
      this.passwordVerifyFieldType = this.passwordVerifyFieldType === 'password' ? 'text' : 'password';
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private handleResponse(form: NgForm) {
    return {
      next: () => {
        this.loading = false;
        form.resetForm();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Registered successfully'
        });
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Registration failed'
        });
      }
    };
  }


}
