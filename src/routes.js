import { Router } from 'express';

import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';

const routes = new Router();

routes.post('/recipients', RecipientController.store);

routes.post('/user', UserController.store);

export default routes;
