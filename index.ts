import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import dotenv from 'dotenv';
dotenv.config();

const StartServer = async () => {
  const app = express();
  await dbConnection();
  await App(app);

  app.listen(8000, () => {
    console.log('Server started on port 8000');
  });
};

StartServer();
