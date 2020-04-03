import request from 'supertest';
import app from '../../../src/app';

import truncate from '../../util/truncate';

describe('Session', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('Se eu chamar a rota /sessions com o usuário inválido, ela deve retornar um erro de login', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'adminnn@fastfeet.com',
        password: '123456789',
      });

    expect(response.body).toHaveProperty('error');
  });

  it('Se eu chamar a rota /sessions com o usuário válido, ela deve retornar o token de autenticação', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'admin@fastfeet.com',
        password: '123456',
      });

    expect(response.body).toHaveProperty('token');
  });
});
