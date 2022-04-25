import express from 'express';
import cors from 'cors';
import config from 'config';
import logger from './utils/logger';
import routes from './routes/routes';

const port: number = config.get<number>('port') || 3036;

const app = express();

app.use(express.json());
app.use(cors());

app.all('/', (req, res) => {
  res.send(`Received ${req.method} request`);
});


app.listen(port, () => {
  logger.info(`Server started on port ${port}`);

  routes(app);
});
