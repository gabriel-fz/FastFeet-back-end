import { Router } from 'express';

import RecipientController from './app/controllers/RecipientController';

const routes = new Router();

routes.post('/recipients', RecipientController.store);

export default routes;
