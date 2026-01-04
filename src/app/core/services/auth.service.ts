import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {}

  // LOGIN (ENTREPRISE + MEMBER)
  login(data: { email: string; password: string }) {
    return this.http.post<{ token: string }>(
      `${this.baseUrl}/login`,
      data
    );
  }

  // REGISTER
  registerCompany(data: any) {
    return this.http.post(`${this.baseUrl}/register/entreprise`, data);
  }

  registerMember(data: any) {
    return this.http.post(`${this.baseUrl}/register/member`, data);
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getRole(): 'entreprise' | 'member' | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded: any = this.jwtHelper.decodeToken(token);
    return decoded?.role ?? null;
  }
}
