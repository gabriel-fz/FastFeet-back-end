import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';

class DeliveryStatusController {
  async index(req, res) {
    // caso o deliveryman queira ver todos os deliveries para entregar
    if (req.query.completed === 'false') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: req.params.id,
          canceled_at: null,
          end_date: null,
        },
        include: [
          {
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
          },
        ],
      });

      return res.json(deliveries);
    }

    // caso o deliveryman queira ver todos os deliveries entregues
    if (req.query.completed === 'true') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: req.params.id,
          end_date: {
            [Op.ne]: null,
          },
        },
        include: [
          {
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
          },
        ],
      });

      return res.json(deliveries);
    }

    return res.status(400).json({ error: 'invalid status' });
  }

  async show(req, res) {
    // caso o deliveryman queira ver quantas entregas pode fazer

    const date = new Date();

    const deliveriesThisDay = await Delivery.findAll({
      where: {
        deliveryman_id: req.params.id,
        start_date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });

    return res.json({ withdrawn_today: deliveriesThisDay.length });
  }

  async update(req, res) {
    const { start_date, end_date, signature_id } = req.body;
    // req.params.deliveryid
    const delivery = await Delivery.findOne({
      where: {
        id: req.params.deliveryid,
        deliveryman_id: req.params.id,
      },
    });

    // verificando se a entrega existe
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not founds.' });
    }

    // verificando se a entrega já foi retirada
    if (start_date && delivery.start_date) {
      return res.status(400).json({ error: 'Delivery withdrawn.' });
    }

    // verificando se a entrega já foi concluida
    if (end_date && delivery.end_date) {
      return res.status(400).json({ error: 'Delivery withdrawn.' });
    }

    // verificando se há o signatura_id junto com o end_date
    if (end_date && !signature_id) {
      return res.status(400).json({ error: 'Inform the signature_id.' });
    }

    if (start_date) {
      const parsedDate = parseISO(start_date);
      const startDay = '08:00';
      const endDay = '18:00';

      const deliveriesCont = await Delivery.findAll({
        where: {
          deliveryman_id: req.params.id,
          start_date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
      });

      // verificando se o entregador já fez 5 retiradas no dia
      if (deliveriesCont.length > 4) {
        return res
          .status(400)
          .json({ error: 'You have reached the limit of daily deliveries.' });
      }

      const time = format(parsedDate, 'HH:mm');

      // varificando se a retirada está dentro do horário comercial
      if (time < startDay || time > endDay) {
        return res.status(400).json({ error: 'Invalid time' });
      }
    }

    await delivery.update(req.body);

    const deliveryUpdate = await Delivery.findByPk(req.params.deliveryid);

    // return
    return res.json(deliveryUpdate);
  }
}

export default new DeliveryStatusController();
