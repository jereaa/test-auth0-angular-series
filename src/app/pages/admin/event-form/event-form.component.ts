import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { ApiService } from './../../../core/api.service';
import { EventFormService } from './event-form.service';

import { EventModel } from './../../../core/models/event.model';
import { FormEventModel } from './../../../core/models/event-form.model';

import { dateValidator } from './../../../core/forms/date.validator';
import { dateRangeValidator } from './../../../core/forms/date-range.validator';
import { DATE_REGEX, TIME_REGEX, stringsToDate } from './../../../core/forms/formUtils.factory';

@Component({
    selector: 'app-event-form',
    templateUrl: './event-form.component.html',
    styleUrls: ['./event-form.component.scss'],
    providers: [EventFormService],
})
export class EventFormComponent implements OnInit, OnDestroy {
    @Input() event: EventModel;
    isEdit: boolean;
    // Formbuilder form
    eventForm: FormGroup;
    datesGroup: AbstractControl;
    // Model storing initial form values
    formEvent: FormEventModel;
    // Form validation and disabled logic
    formErrors: any;
    formChangeSub: Subscription;
    // Form submission
    submitEventObj: EventModel;
    submitEventSub: Subscription;
    error: boolean;
    submitting: boolean;
    submitBtnText: string;

    constructor(
        public ef: EventFormService,
        private api: ApiService,
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.formErrors = this.ef.formErrors;
        this.isEdit = !!this.event;
        this.submitBtnText = this.isEdit ? 'Update Event' : 'Create Event';
        // Set initial form data
        this.formEvent = this._setFormData();
        // User FormBuilder to construct the form
        this._buildForm();
    }

    private _setFormData(): FormEventModel {
        if (!this.isEdit) {
            // If creating a new event, create new
            // FormEventModel with default null data
            return new FormEventModel(null, null, null, null, null, null, null);
        } else {
            // If editing existing event, create new
            // FormEventModel from existing data
            // Transform datetimes:
            // https://angular.io/api/common/DatePipe
            // 'shortDate': 9/3/2010
            // 'shortTime': 12:05 PM
            return new FormEventModel(
                this.event.title,
                this.event.location,
                this.datePipe.transform(this.event.startDatetime, 'shortDate'),
                this.datePipe.transform(this.event.startDatetime, 'shortTime'),
                this.datePipe.transform(this.event.endDatetime, 'shortDate'),
                this.datePipe.transform(this.event.endDatetime, 'shortTime'),
                this.event.viewPublic,
                this.event.description,
            );
        }
    }

    private _buildForm(): void {
        this.eventForm = this.fb.group({
            title: [this.formEvent.title, [
                Validators.required,
                Validators.minLength(this.ef.textMin),
                Validators.maxLength(this.ef.titleMax),
            ]],
            location: [this.formEvent.location, [
                Validators.required,
                Validators.minLength(this.ef.textMin),
                Validators.maxLength(this.ef.locMax),
            ]],
            viewPublic: [this.formEvent.viewPublic, [
                Validators.required,
            ]],
            description: [this.formEvent.description, [
                Validators.maxLength(this.ef.descMax),
            ]],
            datesGroup: this.fb.group({
                startDate: [this.formEvent.startDate, [
                    Validators.required,
                    Validators.maxLength(this.ef.dateMax),
                    Validators.pattern(DATE_REGEX),
                    dateValidator(),
                ]],
                startTime: [this.formEvent.startTime, [
                    Validators.required,
                    Validators.maxLength(this.ef.timeMax),
                    Validators.pattern(TIME_REGEX),
                ]],
                endDate: [this.formEvent.endDate, [
                    Validators.required,
                    Validators.maxLength(this.ef.dateMax),
                    Validators.pattern(DATE_REGEX),
                    dateValidator(),
                ]],
                endTime: [this.formEvent.endTime, [
                    Validators.required,
                    Validators.maxLength(this.ef.timeMax),
                    Validators.pattern(TIME_REGEX),
                ]],
            }, { validator: dateRangeValidator }),
        });
        // Set local property to eventForm datesGroup control
        this.datesGroup = this.eventForm.get('datesGroup');

        // Subscribe to form value changes
        this.formChangeSub = this.eventForm.valueChanges.subscribe((data) => this._onValueChanged(data));

        // If edit: mark fields dirty to trigger immediate
        // validation in case editing an event that is no
        // longer valid (for example, an event in the past)
        if (this.isEdit) {
            const _markDirty = (group) => {
                for (const i in group.controls) {
                    if (group.controls.hasOwnProperty(i)) {
                        group.controls[i].markAsDirty();
                    }
                }
            };
            _markDirty(this.eventForm);
            _markDirty(this.datesGroup);
        }

        this._onValueChanged();
    }

    private _onValueChanged(data?: any): void {
        if (!this.eventForm) {
            return;
        }
        const _setErrMsgs = (control: AbstractControl, errorsObj: any, field: string) => {
            if (control && control.dirty && control.invalid) {
                const messages = this.ef.validationMessages[field];
                for (const key in control.errors) {
                    if (control.errors.hasOwnProperty(key)) {
                        errorsObj[field] += messages[key] + '<br>';
                    }
                }
            }
        };

        // Check validation and set errors
        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                if (field !== 'datesGroup') {
                    // Set errors for fields not inside datesGroup
                    // Clear previous error message (if any)
                    this.formErrors[field] = '';
                    _setErrMsgs(this.eventForm.get(field), this.formErrors, field);
                } else {
                    // Set errors for fields inside datesGroup
                    const datesGroupErrors = this.formErrors['datesGroup'];
                    for (const dateField in datesGroupErrors) {
                        if (datesGroupErrors.hasOwnProperty(dateField)) {
                            // Clear previous error message (if any)
                            datesGroupErrors[dateField] = '';
                            _setErrMsgs(this.datesGroup.get(dateField), datesGroupErrors, dateField);
                        }
                    }
                }
            }
        }
    }

    private _getSubmitObj(): EventModel {
        const startDate = this.datesGroup.get('startDate').value;
        const startTime = this.datesGroup.get('startTime').value;
        const endDate = this.datesGroup.get('endDate').value;
        const endTime = this.datesGroup.get('endTime').value;

        // Convert form startDate/startTime and endDate/endTime
        // to JS dates and populate a new EventModel for submission
        return new EventModel(
            this.eventForm.get('title').value,
            this.eventForm.get('location').value,
            stringsToDate(startDate, startTime),
            stringsToDate(endDate, endTime),
            this.eventForm.get('viewPublic').value,
            this.eventForm.get('description').value,
            this.event ? this.event._id : null,
        );
    }

    onSubmit(): void {
        this.submitting = true;
        this.submitEventObj = this._getSubmitObj();

        if (!this.isEdit) {
            this.submitEventSub = this.api
                .postEvent$(this.submitEventObj)
                .subscribe(
                    this._handleSubmitSuccess.bind(this),
                    this._handleSubmitError.bind(this),
                );
        } else {
            this.submitEventSub = this.api
                .editEvent$(this.event._id, this.submitEventObj)
                .subscribe((res) => {
                    this._handleSubmitSuccess(res);
                }, (err) => {
                    this._handleSubmitError(err);
                });
        }
    }

    private _handleSubmitSuccess(res: EventModel): void {
        this.error = false;
        this.submitting = false;
        // Redirect to event detail
        this.router.navigate(['/event', res._id]);
    }

    private _handleSubmitError(err: Error): void {
        console.error(err);
        this.submitting = false;
        this.error = true;
    }

    resetForm(): void {
        this.eventForm.reset();
    }

    ngOnDestroy(): void {
        if (this.submitEventSub) {
            this.submitEventSub.unsubscribe();
        }
        this.formChangeSub.unsubscribe();
    }

}
