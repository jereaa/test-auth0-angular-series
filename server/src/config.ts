export interface IConfig {
    AUTH0_DOMAN: string;
    AUTH0_API_AUDIENCE: string;
    MONGO_URI: string;
    NAMESPACE: string;
}

export const CONFIG: IConfig = {
    AUTH0_DOMAN: 'jereaa.auth0.com',
    AUTH0_API_AUDIENCE: 'http://localhost:8083/api/',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://jereaa:laputamadre@ds147872.mlab.com:47872/mean-test',
    NAMESPACE: 'http://myapp.com/roles',
}
