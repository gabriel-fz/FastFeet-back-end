import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';

class DeliveryStatusController {
  async index(req, res) {
    // padrão de include para as requisições
    const includeDefault = {
      model: Recipient,
      as: 'recipient',
      attributes: [
        'id',
        'name',
        'address',
        'address_number',
        'complement',
        'state',
        'city',
        'zip_code',
      ],
    };

    // caso o deliveryman queira ver todos os deliveries para entregar
    if (req.query.completed === 'false') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: req.params.deliverymanid,
          canceled_at: null,
          end_date: null,
        },
        include: [includeDefault],
      });

      return res.json(deliveries);
    }

    // caso o deliveryman queira ver todos os deliveries entregues
    if (req.query.completed === 'true') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: req.params.deliverymanid,
          end_date: {
            [Op.ne]: null,
          },
        },
        include: [includeDefault],
      });

      return res.json(deliveries);
    }

    // erro caso o req.query.completed não seja true e nem false
    return res.status(400).json({ error: 'invalid status' });
  }

  async show(req, res) {
    // caso o deliveryman queira ver quantas entregas pode fazer
    const date = new Date();

    const deliveriesThisDay = await Delivery.findAll({
      where: {
        deliveryman_id: req.params.deliverymanid,
        start_date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });

    return res.json({ withdrawn_today: deliveriesThisDay.length });
  }

  async update(req, res) {
    const { start_date, end_date } = req.body;

    const delivery = await Delivery.findOne({
      where: {
        id: req.params.deliveryid,
        deliveryman_id: req.params.deliverymanid,
      },
    });

    // verificando se a entrega existe
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not founds.' });
    }

    // verificando se a entrega já foi cancelada
    if (delivery.canceled_at) {
      return res.status(401).json({ error: 'Delivery canceled.' });
    }

    // verificando se a entrega já foi retirada
    if (start_date && delivery.start_date) {
      return res.status(401).json({ error: 'Delivery withdrawn.' });
    }

    // verificando se a entrega já foi concluida
    if (end_date && delivery.end_date) {
      return res
        .status(401)
        .json({ error: 'Delivery has already been completed.' });
    }

    const deliveryUpdate = await delivery.update(req.body);

    // return
    return res.json(deliveryUpdate);
  }
}

export default new DeliveryStatusController();
