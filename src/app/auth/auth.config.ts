import { ENV } from './../core/env.config';

interface IAuthConfig {
    CLIENT_ID: string;
    CLIENT_DOMAIN: string;
    AUDIENCE: string;
    REDIRECT: string;
    SCOPE: string;
    NAMESPACE: string;
};

export const AUTH_CONFIG: IAuthConfig = {
    CLIENT_ID: 'G0inVjcXnYucOEHr1d0QYC51w5WFE7ZY',
    CLIENT_DOMAIN: 'jereaa.auth0.com',
    AUDIENCE: 'http://localhost:8083/api/', // likely http://localhost:8083/api/
    REDIRECT: `${ENV.BASE_URI}/callback`,
    SCOPE: 'openid profile',
    NAMESPACE: 'http://myapp.com/roles',
};
