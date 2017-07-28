import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from './../../auth/auth.service';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';

import { EventModel } from './../../core/models/event.model';

@Component({
    selector: 'app-event',
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit, OnDestroy {

    pageTitle: string;
    id: string;
    routeSub: Subscription;
    tabSub: Subscription;
    eventSub: Subscription;
    event: EventModel;
    loading: boolean;
    error: boolean;
    tab: string;
    eventPast: boolean;

    constructor(
        private title: Title,
        private route: ActivatedRoute,
        private api: ApiService,
        public auth: AuthService,
        public utils: UtilsService,
    ) { }

    ngOnInit(): void {
        // Set event ID from route params and subscribe
        this.routeSub = this.route.params.subscribe((params) => {
            this.id = params['id'];
            this._getEvent();
        });

        // Subscribe to query params to watch for tab changes
        this.tabSub = this.route.queryParams.subscribe((queryParams) => {
            this.tab = queryParams['tab'] || 'details';
        });
    }

    private _getEvent(): void {
        this.loading = true;
        // GET event by ID
        this.eventSub = this.api.getEventById$(this.id).subscribe((res) => {
            this.event = res;
            this._setPageTitle(this.event.title);
            this.loading = false;
            this.eventPast = this.utils.eventPast(res.endDatetime);
        }, (err) => {
            console.error(err);
            this.loading = false;
            this.error = true;
            this._setPageTitle('Event Details');
        });
    }

    private _setPageTitle(title: string) {
        this.pageTitle = title;
        this.title.setTitle(title);
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
        this.tabSub.unsubscribe();
        this.eventSub.unsubscribe();
    }

}
