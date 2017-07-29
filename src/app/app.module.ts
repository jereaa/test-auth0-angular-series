import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, Http, RequestOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthHttp } from 'angular2-jwt';

import { AppRoutingModule } from './app-routing.module';

import { AuthService } from './auth/auth.service';
import { ApiService } from './core/api.service';
import { UtilsService } from './core/utils.service';
import { FilterSortService } from './core/filter-sort.service';

import { authHttpFactory } from './auth/auth-http.factory';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { LoadingComponent } from './core/loading.component';
import { AdminComponent } from './pages/admin/admin.component';
import { EventComponent } from './pages/event/event.component';
import { EventDetailComponent } from './pages/event/event-detail/event-detail.component';
import { RsvpComponent } from './pages/event/rsvp/rsvp.component';
import { RsvpFormComponent } from './pages/event/rsvp/rsvp-form/rsvp-form.component';
import { SubmittingComponent } from './core/forms/submitting.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        HeaderComponent,
        FooterComponent,
        CallbackComponent,
        LoadingComponent,
        AdminComponent,
        EventComponent,
        EventDetailComponent,
        RsvpComponent,
        RsvpFormComponent,
        SubmittingComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
    ],
    providers: [
        Title,
        AuthService,
        ApiService,
        DatePipe,
        UtilsService,
        FilterSortService,
        {
            provide: AuthHttp,
            useFactory: authHttpFactory,
            deps: [ Http, RequestOptions ],
        },
    ],
    bootstrap: [ AppComponent ],
})
export class AppModule { }
