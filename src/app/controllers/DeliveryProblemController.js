import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';
import Deliveryman from '../models/Deliveryman';

class DeliveryProblemController {
  async index(req, res) {
    return res.json({ ok: true });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery_id = req.params.id;
    const { description } = req.body;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found.' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const deliveryProblem = await DeliveryProblem.findByPk(req.params.id, {
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'canceled_at'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    if (!deliveryProblem) {
      return res.status(400).json({ error: 'Delivery problem not found.' });
    }

    if (deliveryProblem.delivery.canceled_at) {
      return res.status(400).json({ error: 'Delivery is already canceled.' });
    }

    deliveryProblem.delivery.canceled_at = new Date();

    await deliveryProblem.delivery.save();

    // envio de email de cancelamento
    await Queue.add(CancellationMail.key, {
      deliveryProblem,
    });

    return res.json({ ok: true });
  }
}

export default new DeliveryProblemController();
