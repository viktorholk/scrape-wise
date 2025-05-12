import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import routes from './routes/index';

const app: Application = express();
const port = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());


app.use('/', routes)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
