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

import validateSessionStore from './app/validators/SessionStore';
import validateDeliveryStore from './app/validators/DeliveryStore';
import validateDeliveryUpdate from './app/validators/DeliveryUpdate';
import validateDeliverymanStore from './app/validators/DeliverymanStore';
import validateDeliverymanUpdate from './app/validators/DeliverymanUpdate';
import validateDeliveryProblemStore from './app/validators/DeliveryProblemStore';
import validateDeliveryStatusUpdate from './app/validators/DeliveryStatusUpdate';
import validateRecipientStore from './app/validators/RecipientStore';
import validateRecipientUpdate from './app/validators/RecipientUpdate';

import authMiddleware from './app/middlewares/auth';
import authDeliveryman from './app/middlewares/authDeliveryman';

const routes = new Router();
const upload = multer(multerConfig);

// login de administrador
routes.post('/sessions', validateSessionStore, SessionController.store);

// listagem de deliveries
routes.get(
  '/deliveryman/:id/deliveries',
  authDeliveryman,
  DeliveryStatusController.index
);

// listagem de retiradas do deliveryman no dia
routes.get(
  '/deliveryman/:id/withdraw',
  authDeliveryman,
  DeliveryStatusController.show
);

// upload de signature
routes.post(
  '/deliveryman/:id/signature',
  upload.single('file'),
  authDeliveryman,
  FileController.store
);
// update de deliveries
routes.put(
  '/deliveryman/:id/deliveries/:deliveryid',
  authDeliveryman,
  validateDeliveryStatusUpdate,
  DeliveryStatusController.update
);

// cadastro de problemas de deliveries
routes.post(
  '/deliveryman/:id/problems',
  validateDeliveryProblemStore,
  DeliveryProblemController.store
);
// listagem de um deliveryman
routes.get('/deliverymans/:id', DeliverymanController.show);
// lista de problemas de uma delivery
routes.get('/delivery/:id/problems', DeliveryProblemController.index);

// listagem de administradores
routes.get('/user', UserController.index);

// middleware de autenticação do administrador
routes.use(authMiddleware);

// cadastro de recipients
routes.post('/recipients', validateRecipientStore, RecipientController.store);
// listagem de recipients
routes.get('/recipients', RecipientController.index);
// listagem de um recipient
routes.get('/recipients/:id', RecipientController.show);
// atualização de recipients
routes.put(
  '/recipients/:id',
  validateRecipientUpdate,
  RecipientController.update
);
// exclusão de recipients
routes.delete('/recipients/:id', RecipientController.delete);

// upload de arquivos
routes.post('/files', upload.single('file'), FileController.store);

// cadastro de deliverymans
routes.post(
  '/deliverymans',
  validateDeliverymanStore,
  DeliverymanController.store
);
// listagem de deliverymans
routes.get('/deliverymans', DeliverymanController.index);
// atualização de deliverymans
routes.put(
  '/deliverymans/:id',
  validateDeliverymanUpdate,
  DeliverymanController.update
);
// exclusão de deliverymans
routes.delete('/deliverymans/:id', DeliverymanController.delete);

// cadastro de deliveries
routes.post('/deliveries', validateDeliveryStore, DeliveryController.store);
// listagem de deliveries
routes.get('/deliveries', DeliveryController.index);
// listagem de um delivery
routes.get('/deliveries/:id', DeliveryController.show);
// atualização de deliveries
routes.put(
  '/deliveries/:id',
  validateDeliveryUpdate,
  DeliveryController.update
);
// exclusão de deliveries
routes.delete('/deliveries/:id', DeliveryController.delete);

// lista de deliveries com problemas
routes.get('/delivery/problems', DeliveryProblemController.show);
// cancelamento de deliveries
routes.delete('/problem/:id/cancel-delivery', DeliveryProblemController.delete);

export default routes;
