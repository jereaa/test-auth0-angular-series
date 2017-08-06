import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, Http, RequestOptions } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthHttp } from 'angular2-jwt';

import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';

import { authHttpFactory } from './auth/auth-http.factory';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { MyRsvpsComponent } from './pages/my-rsvps/my-rsvps.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        CallbackComponent,
        MyRsvpsComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AuthModule,
        CoreModule,
    ],
    providers: [
        Title,
        {
            provide: AuthHttp,
            useFactory: authHttpFactory,
            deps: [ Http, RequestOptions ],
        },
    ],
    bootstrap: [ AppComponent ],
})
export class AppModule { }
