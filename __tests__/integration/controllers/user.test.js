import request from 'supertest';
import app from '../../../src/app';

describe('Deliveryman', () => {
  it('Se eu chamar a rota /user com o email do admin, ela deve retornar ID do admin', async () => {
    const response = await request(app)
      .get('/user')
      .send({
        email: 'admin@fastfeet.com',
      });

    expect(response.body).toHaveProperty('id');
  });
});
