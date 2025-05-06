import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import { prisma } from './lib/database';
import routes from './routes/index';
const app: Application = express();
const port = process.env.PORT || 8000;


app.use(cors());
app.use(express.json());


app.use('/', routes)

app.get('/', async (req: Request, res: Response) => {

  console.log(req)

  const user = await prisma.user.create({
    data: {

      email: "test@tst",
      password: "wdadawdaw"
    }
  })

  res.send('Hello Wor---ld ' + user.email);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
