import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import { ApiService } from '../../core/api.service';
import { UtilsService } from '../../core/utils.service';
import { FilterSortService } from '../../core/filter-sort.service';

import { EventModel } from '../../core/models/event.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [ './home.component.scss' ],
})
export class HomeComponent implements OnInit, OnDestroy {

    pageTitle = 'Events';
    eventListSub: Subscription;
    eventList: EventModel[];
    filteredEvents: EventModel[];
    loading: boolean;
    error: boolean;
    query: '';

    constructor(
        private title: Title,
        private api: ApiService,
        public utils: UtilsService,
        public fs: FilterSortService,
    ) { }

    ngOnInit(): void {
        this.title.setTitle(this.pageTitle);
        this._getEventsList();
    }

    private _getEventsList(): void {
        this.loading = true;
        // Get future, public events
        this.eventListSub = this.api
            .getEvents$()
            .subscribe((res) => {
                this.eventList = res;
                this.filteredEvents = res;
                this.loading = false;
            },
            (err) => {
                console.error(err);
                this.loading = false;
                this.error = true;
            });
    }

    searchEvents(): void {
        this.filteredEvents = this.fs.search(this.eventList, this.query, '_id', 'mediumDate');
    }

    resetQuery(): void {
        this.query = '';
        this.filteredEvents = this.eventList;
    }

    ngOnDestroy(): void {
        this.eventListSub.unsubscribe();
    }

}
