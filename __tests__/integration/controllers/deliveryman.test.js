import request from 'supertest';
import app from '../../../src/app';

describe('Deliveryman', () => {
  it('Se eu chamar a rota /deliverymans com dados de criação válidos sem fazer login, ela deve retornar erro de Token not provided', async () => {
    const response = await request(app)
      .post('/deliverymans')
      .send({
        name: 'Gabriel',
        email: 'gabriel5@gmail.com',
      });

    expect(response.body).toHaveProperty('error');
  });
});
