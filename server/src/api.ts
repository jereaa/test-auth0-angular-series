import * as express from 'express';
import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';
import { IConfig } from './config';

import { EventSchema, IEventModel } from './models/event';
import { RsvpSchema, IRsvpModel } from './models/rsvp';

export default function(app: express.Application, config: IConfig) {
    const jwtCheck = jwt({
        secret: jwks.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `https://${config.AUTH0_DOMAN}/.well-known/jwks.json`,
        }),
        aud: config.AUTH0_API_AUDIENCE,
        issuer: `https://${config.AUTH0_DOMAN}/`,
        algorithm: 'RS256',
    });

    const adminCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const roles = req.user[ config.NAMESPACE ] || [];
        if (roles.indexOf('admin') > -1) {
            next();
        } else {
            res.status(401).json({ message: 'Not authorized for admin access' });
        }
    };

    app.get('/api', (req: express.Request, res: express.Response) => {
        res.send('API works');
    });

    const _eventListProjection = 'title startDatetime endDatetime viewPublic';

    // Get all public events
    app.get('/api/events', (req: express.Request, res: express.Response) => {
        EventSchema.find({ viewPublic: true, startDatetime: { $gte: new Date() } },
            _eventListProjection, (err: Error, events: IEventModel[]) => {
            const eventsArr: IEventModel[] = [];
            if (err) {
                return res.status(500).send({ message: err.message });
            }

            if (events) {
                events.forEach((event: IEventModel) => {
                    eventsArr.push(event);
                });
            }
            res.send(eventsArr);
        });
    });

    // Get all events (admin required)
    app.get('/api/events/admin', jwtCheck, adminCheck, (req: express.Request, res: express.Response) => {
        EventSchema.find({}, _eventListProjection, (err: Error, events: IEventModel[]) => {
            const eventsArr: IEventModel[] = [];
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (events) {
                events.forEach((event: IEventModel) => {
                    eventsArr.push(event);
                });
            }
            res.send(eventsArr);
        });
    });

    // Get event by event ID
    app.get('/api/event/:id', jwtCheck, (req: express.Request, res: express.Response) => {
        EventSchema.findById(req.params.id, (err: Error, event: IEventModel) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (!event) {
                return res.status(400).send({ message: 'Event not found' });
            }
            res.send(event);
        });
    });

    // Get RSVPs by Event ID
    app.get('/api/event/:id/rsvps', jwtCheck, (req: express.Request, res: express.Response) => {
        RsvpSchema.find({ eventId: req.params.id }, (err: Error, rsvps: IRsvpModel[]) => {
            const rsvpsArr: IRsvpModel[] = [];
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (rsvps) {
                rsvps.forEach((rsvp: IRsvpModel) => {
                    rsvpsArr.push(rsvp);
                })
            }
            return res.send(rsvpsArr);
        });
    });
}
