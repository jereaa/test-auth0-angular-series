import * as express from 'express';
import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';
import { IConfig } from './config';

import { EventSchema } from './models/event';
import { RsvpSchema } from './models/rsvp';

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
}
