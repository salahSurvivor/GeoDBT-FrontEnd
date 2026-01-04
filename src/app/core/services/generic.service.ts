import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
    providedIn: 'root'
})

export class GenericService {
    private readonly baseUrl = environment.apiUrl;
    constructor(private http: HttpClient, private jwt: JwtHelperService) { }


    create(data: any, entity: string) {
        data.authCode = this.getAuthCode();
        return this.http.post<{ token: string }>(this.baseUrl + `/${entity}/`, data);
    }

    read(entity: string) {
        let params = { authCode: this.getAuthCode() };
        return this.http.get(this.baseUrl + `/${entity}/`, { params });
    }

    readWithPaginatorSystem(entity: string, data: any) {
        let params = { authCode: this.getAuthCode(), paginatorSystem: true };
        return this.http.post(`${this.baseUrl}/${entity}`, data, { params });
    }

    /* update(data: any, entity: string) {
         return this.http.put(this.baseUrl+ `/${entity}/`, data);
     }*/

    update(data: any, entity: string) {
        return this.http.patch(`${this.baseUrl}/${entity}/${data._id}`, data);
    }

    delete(entity: string, id: string) {
        return this.http.delete(`${this.baseUrl}/${entity}/${id}`);
    }

    getAuthCode() {
        const token = localStorage.getItem('token');
        if (!token) { return ''; }

        const decoded: any = this.jwt.decodeToken(token);
        console.log(decoded?.authCode || '')
        return decoded?.authCode || '';
    }
}
