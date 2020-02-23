import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryStatusController from './app/controllers/DeliveryStatusController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';
import authDeliveryman from './app/middlewares/authDeliveryman';

const routes = new Router();
const upload = multer(multerConfig);

// login de administrador
routes.post('/sessions', SessionController.store);

// listagem de deliveries
routes.get(
  '/deliveyman/:id/deliveries',
  authDeliveryman,
  DeliveryStatusController.index
);
// upload de signature
routes.post(
  '/deliveyman/:id/signature',
  upload.single('file'),
  authDeliveryman,
  FileController.store
);
// update de deliveries
routes.put(
  '/deliveyman/:id/deliveries/:deliveryid',
  authDeliveryman,
  DeliveryStatusController.update
);

// cadastro de problemas de deliveries
routes.post('/deliveyman/:id/problems', DeliveryProblemController.store);

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

// cadastro de deliverymans
routes.post('/deliverymans', DeliverymanController.store);
// listagem de deliverymans
routes.get('/deliverymans/', DeliverymanController.index);
// atualização de deliverymans
routes.put('/deliverymans/:id', DeliverymanController.update);
// exclusão de deliverymans
routes.delete('/deliverymans/:id', DeliverymanController.delete);

// cadastro de deliveries
routes.post('/deliveries', DeliveryController.store);
// listagem de deliveries
routes.get('/deliveries', DeliveryController.index);
// atualização de deliveries
routes.put('/deliveries/:id', DeliveryController.update);
// exclusão de deliveries
routes.delete('/deliveries/:id', DeliveryController.delete);

// lista de problemas de uma delivery
routes.get('/delivery/:id/problems', DeliveryProblemController.index);
// cancelamento de deliveries
routes.delete('/problem/:id/cancel-delivery', DeliveryProblemController.delete);

export default routes;
