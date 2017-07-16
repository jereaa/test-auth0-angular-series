import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
    navOpen: boolean;
    minHeight: string;
    private _initWinHeight = 0;

    constructor(private authService: AuthService) {
        authService.handleAuth();
    }

    ngOnInit(): void {
        Observable.fromEvent(window, 'resize')
            .debounceTime(200)
            .subscribe(event => this._resizeFn(event));

        this._initWinHeight = window.innerHeight;
        this._resizeFn(null);
    }

    navToggledHandler(e: boolean): void {
        this.navOpen = e;
    }

    private _resizeFn(e): void {
        const winHeight: number = e ? e.target.innerHeight : this._initWinHeight;
        this.minHeight = `${winHeight}px`;
    }
}
