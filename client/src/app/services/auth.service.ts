import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const helper = new JwtHelperService();
const TOKEN_KEY = 'jwt-token';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public _user: Observable<boolean>;
    private _userData = new BehaviorSubject(null);

    constructor(
        private storage: Storage,
        private http: HttpClient,
        private platform: Platform,
        private router: Router
    ) {
        this.loadStoredToken();
    }

    public loadStoredToken(): void {
        const _platform = from(this.platform.ready());

        this._user = _platform.pipe(
            switchMap(() => from(this.storage.get(TOKEN_KEY))),
            map(token => {
                if (token) {
                    let decoded = helper.decodeToken(token);
                    this._userData.next(decoded);
                    return true;
                } else {
                    return null;
                }
            })
        );
    }

    public login(credentials: { username: string, password: string }): Observable<any> {
        const customerToken =
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NzU2NzM3NzYsImV4cCI6MTYwNzIwOTc3NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImVtYWlsIjoianJvY2tldEBleGFtcGxlLmNvbSIsInJvbGUiOiJDVVNUT01FUiJ9.JYKTW2a23hUooVO9IvmzuBgWGO0PWIojhGgfqnRZhqk';
        const driverToken =
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NzU2NzM3NzYsImV4cCI6MTYwNzIwOTc3NiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImZpcnN0TmFtZSI6IkJvYiIsImxhc3ROYW1lIjoiRG9lIiwidXNlcm5hbWUiOiJib2IiLCJlbWFpbCI6ImJvYmJ5QGV4YW1wbGUuY29tIiwicm9sZSI6IkRSSVZFUiJ9.qP_-4w1eFxF_MtaQStG5cgzhyEhCisZf31sp_MgqKAI';

        let token = '';

        if (credentials.username === 'john' && credentials.password === '1234') {
            token = customerToken;
        } else if (credentials.username === 'bob' && credentials.password === '1234') {
            token = driverToken;
        } else {
            return of(null);
        }

        return this.http.get('https://randomuser.me/api/').pipe(
            take(1),
            map(res => {
                return token;
            }),
            switchMap(token => {
                this._userData.next(helper.decodeToken(token));
                return from(this.storage.set(TOKEN_KEY, token));
            })
        );
    }

    public getUser(): any {
        return this._userData.getValue();
    }

    public onUserChanged(): Observable<any> {
        return this._userData.asObservable();
    }

    public logout(): void {
        this.storage.remove(TOKEN_KEY).then(() => {
            this.router.navigateByUrl('/login');
            this._userData.next(null);
        });
    }
}
