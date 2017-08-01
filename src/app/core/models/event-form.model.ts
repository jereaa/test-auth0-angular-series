export class FormEventModel {
    constructor(
        public title: string,
        public location: string,
        public startDate: string,
        public startTime: string,
        public endDate: string,
        public endTime: string,
        public viewPublic: boolean,
        public description?: string,
    ) {}
}
