import { Router } from 'express';

import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

routes.post('/recipients', RecipientController.store);
routes.post('/user', UserController.store);
routes.post('/sessions', SessionController.store);

export default routes;
