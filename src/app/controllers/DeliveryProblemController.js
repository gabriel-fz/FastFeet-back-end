import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';
import Deliveryman from '../models/Deliveryman';

class DeliveryProblemController {
  async index(req, res) {
    const problems = await DeliveryProblem.findAll({
      where: {
        delivery_id: req.params.deliveryid,
      },
      order: ['id'],
    });

    if (!problems) {
      return res.status(400).json({ error: 'No problems with delivery' });
    }

    return res.json(problems);
  }

  async show(req, res) {
    /**
    const problems = await DeliveryProblem.aggregate(
      'delivery_id',
      'distinct',
      {
        plain: false,
      }
    );

    const idsProblem = problems.map(p => p.distinct);
     */

    const deliveriesProblem = await DeliveryProblem.findAll({
      order: ['id'],
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          where: {
            canceled_at: null,
            end_date: null,
          },
        },
      ],
    });

    return res.json(deliveriesProblem);
  }

  async store(req, res) {
    const delivery_id = req.params.deliveryid;
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
    const deliveryProblem = await DeliveryProblem.findByPk(
      req.params.problemid,
      {
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
      }
    );

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
