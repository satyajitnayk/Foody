import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import dotenv from 'dotenv';
import { PORT } from './config';
dotenv.config();

const StartServer = async () => {
  const app = express();
  await dbConnection();
  await App(app);

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

StartServer();
