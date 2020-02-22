import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// login de administrador
routes.post('/sessions', SessionController.store);

// middleware de autenticação do administrador
routes.use(authMiddleware);

// listagem de administradores
routes.get('/user', UserController.index);

// cadastro de recipients
routes.post('/recipients', RecipientController.store);
// atualização de recipients
routes.put('/recipients/:id', RecipientController.update);

// upload de arquivos
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
