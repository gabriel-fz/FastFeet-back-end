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

// listagem de administradores
routes.get('/user', UserController.store);

// cadastro de recipients
routes.post('/recipients', RecipientController.store);
// atualização de recipients
routes.put('/recipients/:id', RecipientController.update);

export default routes;
