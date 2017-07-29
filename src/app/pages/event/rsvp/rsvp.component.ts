import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { expandCollapse } from './../../../core/expand-collapse.animation';

import { AuthService } from './../../../auth/auth.service';
import { ApiService } from './../../../core/api.service';
import { UtilsService } from './../../../core/utils.service';
import { FilterSortService } from './../../../core/filter-sort.service';

import { RsvpModel } from './../../../core/models/rsvp.model';

@Component({
    selector: 'app-rsvp',
    templateUrl: './rsvp.component.html',
    styleUrls: ['./rsvp.component.scss'],
    animations: [expandCollapse],
})
export class RsvpComponent implements OnInit, OnDestroy {

    @Input() eventId: string;
    @Input() eventPast: boolean;
    rsvpsSub: Subscription;
    rsvps: RsvpModel[];
    loading: boolean;
    error: boolean;
    userRsvp: RsvpModel;
    totalAttending: number;
    footerTense: string;
    showAllRsvps = false;
    showRsvpsText = 'View all RSVPs';
    showEditForm: boolean;
    editBtnText: string;

    constructor(
        public auth: AuthService,
        public utils: UtilsService,
        public fs: FilterSortService,
        private api: ApiService,
    ) { }

    ngOnInit(): void {
        this.footerTense = !this.eventPast ? 'plan to attend this event.' : 'attended this event.';
        this.toggleEditForm(false);
        this._getRSVPs();
    }

    private _getRSVPs(): void {
        this.loading = true;
        // GET RSVPs by eventID
        this.rsvpsSub = this.api
            .getRsvpsByEventId$(this.eventId)
            .subscribe((res) => {
                this.rsvps = res;
                this._updateRsvpState();
                this.loading = false;
            }, (err) => {
                console.error(err);
                this.loading = false;
                this.error = true;
            });
    }

    toggleShowRsvps(): void {
        this.showAllRsvps = !this.showAllRsvps;
        this.showRsvpsText = this.showAllRsvps ? 'Hide RSVPs' : 'Show all RSVPs';
    }

    toggleEditForm(setVal?: boolean): void {
        this.showEditForm = setVal !== undefined ? setVal : !this.showEditForm;
        this.editBtnText = this.showEditForm ? 'Cancel edit' : 'Edit my RSVP';
    }

    onSubmitRsvp(e): void {
        if (e.rsvp) {
            this.userRsvp = e.rsvp;
            this._updateRsvpState(true);
            this.toggleEditForm(false);
        }
    }

    private _updateRsvpState(changed?: boolean): void {
        // If RSVP matching user ID is already
        // in RSVP array, set as initial RSVP
        const _initialUserRsvp = this.rsvps.filter((rsvp) => {
            return rsvp.userId === this.auth.userProfile.sub;
        })[0];

        // If user has not RSVPed before and has made
        // a change, push new RSVP to local RSVPs store
        if (!_initialUserRsvp && this.userRsvp && changed) {
            this.rsvps.push(this.userRsvp);
        }
        this._setUserRsvpGetAttending(changed);
    }

    private _setUserRsvpGetAttending(changed?: boolean): void {
        // Iterate over RSVPs to get/set user's RSVP
        // and get total number of attending guests
        let guests = 0;
        const rsvpArr = this.rsvps.map((rsvp) => {
            // If user has an existing RSVP
            if (rsvp.userId === this.auth.userProfile.sub) {
                if (changed) {
                    // If user edited their RSVP, set with updated data
                    rsvp = this.userRsvp;
                } else {
                    // If no changes were made, set userRsvp property
                    // (This applies on ngOnInit)
                    this.userRsvp = rsvp;
                }
            }
            // Count total number of attendees
            // + additional guests
            if (rsvp.attending) {
                guests++;
                if (rsvp.guests) {
                    guests += rsvp.guests;
                }
            }
            return rsvp;
        });
        this.rsvps = rsvpArr;
        this.totalAttending = guests;
    }

    ngOnDestroy(): void {
        this.rsvpsSub.unsubscribe();
    }

}
