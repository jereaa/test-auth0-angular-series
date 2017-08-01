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

    app.post('/api/rsvp/new', jwtCheck, (req: express.Request, res: express.Response) => {
        RsvpSchema.findOne({ eventId: req.body.eventId, userId: req.body.userId }, (err: Error, existingRsvp: IRsvpModel) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (existingRsvp) {
                return res.status(409).send({ message: 'You have already RSVPed to this event.' });
            }
            const rsvp = new RsvpSchema({
                userId: req.body.userId,
                name: req.body.name,
                eventId: req.body.eventId,
                attending: req.body.attending,
                guests: req.body.guests,
                comments: req.body.comments,
            });
            rsvp.save((error: Error) => {
                if (error) {
                    return res.status(500).send({ message: error.message });
                }
                res.send(rsvp);
            });
        });
    });

    app.put('/api/rsvp/:id', jwtCheck, (req: express.Request, res: express.Response) => {
        RsvpSchema.findById(req.params.id, (err: Error, rsvp: IRsvpModel) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (!rsvp) {
                return res.status(400).send({ message: 'RSVP not found.' });
            }
            if (rsvp.userId !== req.user.sub) {
                return res.status(401).send({ message: 'You cannot edit someone else\'s RSVP.' });
            }
            rsvp.name = req.body.name;
            rsvp.attending = req.body.attending;
            rsvp.guests = req.body.guests;
            rsvp.comments = req.body.comments;

            rsvp.save((error: Error) => {
                if (error) {
                    return res.status(500).send({ message: error.message });
                }
                res.send(rsvp);
            });
        });
    });

    // POST a new event
    app.post('/api/event/new', jwtCheck, adminCheck, (req: express.Request, res: express.Response) => {
        EventSchema.findOne({
            title: req.body.title,
            location: req.body.location,
            startDatetime: req.body.startDatetime,
        }, (err: Error, existingEvent: IEventModel) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (existingEvent) {
                return res.status(409)
                    .send({ message: 'You have already created an event with this title, location, and start date/time.' });
            }
            const event = new EventSchema({
                title: req.body.title,
                location: req.body.location,
                startDatetime: req.body.startDatetime,
                endDatetime: req.body.endDatetime,
                description: req.body.description,
                viewPublic: req.body.viewPublic,
            });
            event.save((error: Error) => {
                if (error) {
                    return res.status(500).send({ message: error.message });
                }
                res.send(event);
            });
        });
    });

    // PUT (edit) an existing event
    app.put('/api/event/:id', jwtCheck, adminCheck, (req: express.Request, res: express.Response) => {
        EventSchema.findById(req.params.id, (err: Error, event: IEventModel) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (!event) {
                return res.status(400).send({ message: 'Event not found.' });
            }
            event.title = req.body.title;
            event.location = req.body.location;
            event.startDatetime = req.body.startDatetime;
            event.endDatetime = req.body.endDatetime;
            event.viewPublic = req.body.viewPublic;
            event.description = req.body.description;

            event.save((error: Error) => {
                if (error) {
                    return res.status(500).send({ message: error.message });
                }
                res.send(event);
            });
        });
    });

    // DELETE and event and all associated RSVPs
    app.delete('/api/event/:id', jwtCheck, adminCheck, (req: express.Request, res: express.Response) => {
        EventSchema.findById(req.params.id, (err: Error, event: IEventModel) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            if (!event) {
                return res.status(400).send({ message: 'Event not found.' });
            }
            RsvpSchema.find({ eventId: req.params.id }, (error: Error, rsvps: IRsvpModel[]) => {
                if (rsvps) {
                    rsvps.forEach((rsvp: IRsvpModel) => {
                        rsvp.remove();
                    });
                }
                event.remove((error2: Error) => {
                    if (error2) {
                        return res.status(500).send({ message: error2.message });
                    }
                    res.status(200).send({ message: 'Event and RSVPs successfully deleted.' });
                });
            });
        });
    });
}
