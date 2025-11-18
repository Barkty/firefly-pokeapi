import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import paginator from "mongoose-paginate-v2";
import compression from 'compression';
import { GlobalErrorCatcherMiddleware } from '../middleware/global-error-catcher.middleware';
import { ROUTE_BASE, v1Router } from '../routes';
import { corsOptions } from './cors';

import '../helper/scheduler';

paginator.paginate.options = { lean: true, leanWithId: false };

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use(cors(corsOptions));

app.use(express.static('public'));

// Use helmet to secure Express headers
app.use(helmet());
app.disable('x-powered-by');
app.use(morgan("dev"))

app.get('/health', (_, res) => res.json({ message: 'Okay' }));

app.use(ROUTE_BASE.V1_PATH, v1Router);

app.use((_, res) =>
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Resource Not Found'
  })
);

app.use(GlobalErrorCatcherMiddleware); // must be last applied middleware to catch globalErrs

export default app;
