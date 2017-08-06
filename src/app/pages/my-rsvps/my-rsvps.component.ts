import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/subscription';

import { AuthService } from './../../auth/auth.service';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { FilterSortService } from './../../core/filter-sort.service';

import { EventModel } from './../../core/models/event.model';

@Component({
    selector: 'app-my-rsvps',
    templateUrl: './my-rsvps.component.html',
    styleUrls: ['./my-rsvps.component.scss'],
})
export class MyRsvpsComponent implements OnInit, OnDestroy {
    pageTitle = 'My RSVPs';
    eventListSub: Subscription;
    eventList: EventModel[];
    loading: boolean;
    error: boolean;
    userIdp: string;

    constructor(
        public auth: AuthService,
        public fs: FilterSortService,
        public utils: UtilsService,
        private title: Title,
        private api: ApiService,
    ) { }

    ngOnInit(): void {
        this.title.setTitle(this.pageTitle);
        this.userIdp = this._getIdp;
        this._getEventList();
    }

    private _getEventList(): void {
        this.loading = true;
        // Get events user has RSVPed to
        this.eventListSub = this.api
            .getUserEvents$(this.auth.userProfile.sub)
            .subscribe((res) => {
                this.eventList = res;
                this.loading = false;
            }, (err) => {
                console.error(err);
                this.loading = false;
                this.error = true;
            });
    }

    private get _getIdp(): string {
        const sub = this.auth.userProfile.sub.split('|')[0];
        let idp = sub;

        idp = sub === 'auth0' ? 'Username/Password' : idp === 'google-oauth2' ? 'Google' : this.utils.capitalize(sub);
        return idp;
    }

    ngOnDestroy(): void {
        this.eventListSub.unsubscribe();
    }

}
