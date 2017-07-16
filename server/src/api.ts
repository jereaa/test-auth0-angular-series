import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';

import { Express } from 'express';
import { Config } from './config';

module.exports = (app: Express, config: Config) => {
    const jwtCheck = jwt({
        secret: jwks.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `https://${config.AUTH0_DOMAN}/.well-known/jwks.json`
        }),
        aud: config.AUTH0_API_AUDIENCE,
        issuer: `https://${config.AUTH0_DOMAN}/`,
        algorithm: 'RS256'
    });

    app.get('/api', (req, res) => {
        res.send('API works');
    });
}
