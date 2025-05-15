import express, { Application, Request } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { createServer } from 'http';
dotenv.config();

import routes from './routes/index';
import { initWebSocket } from './lib/websocket';
const app: Application = express();

const server = createServer(app);
initWebSocket(server);

const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/', routes);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;