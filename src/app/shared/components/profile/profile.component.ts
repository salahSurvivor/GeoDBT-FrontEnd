import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  entreprise: any = null;
  inviteToken: string | null = null;
  role: 'entreprise' | 'member' | null = null;
  loading = false;

  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.role = payload.role;
      }

      this.loadProfile();
    }
  }


  loadProfile(): void {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token')
      : null;

    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get(`${this.baseUrl}/profile`, { headers }).subscribe({
      next: (res: any) => {
        this.entreprise = res;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
      }
    });
  }

  generateInvite(): void {
    this.loading = true;

    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token')
      : null;

    if (!token) {
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>(`${this.baseUrl}/invite-member`, {}, { headers }).subscribe({
      next: (res) => {
        this.inviteToken = res.token;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur génération invitation:', err);
        this.loading = false;
      }
    });
  }

  copyToken(): void {
    if (!this.inviteToken) return;

    navigator.clipboard.writeText(this.inviteToken).then(() => {
      alert('Invitation code copied ✔');
    });
  }
}
