import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApiService } from './api.service';
import { UtilsService } from './utils.service';
import { FilterSortService } from './filter-sort.service';

import { SubmittingComponent } from './forms/submitting.component';
import { LoadingComponent } from './loading.component';
import { HeaderComponent } from './../header/header.component';
import { FooterComponent } from './../footer/footer.component';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        HeaderComponent,
        FooterComponent,
        LoadingComponent,
        SubmittingComponent,
    ],
    providers: [
        Title,
        DatePipe,
        ApiService,
        UtilsService,
        FilterSortService,
    ],
    exports: [
        HttpClientModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        HeaderComponent,
        FooterComponent,
        LoadingComponent,
        SubmittingComponent,
    ],
})
export class CoreModule { }
