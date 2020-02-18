import { Router } from 'express';

import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// login de administrador
routes.post('/sessions', SessionController.store);

// middleware de autenticação do administrador
routes.use(authMiddleware);

// cadastro de recipients
routes.post('/recipients', RecipientController.store);
// listagem de administradores
routes.post('/user', UserController.store);

export default routes;
