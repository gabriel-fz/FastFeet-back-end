import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
import * as Yup from 'yup';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';

class DeliveryStatusController {
  async index(req, res) {
    // caso o deliveryman queira ver todos os deliveries para entregar
    if (req.query.status === 'all') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: req.params.id,
          canceled_at: null,
          end_date: null,
        },
      });

      return res.json(deliveries);
    }

    // caso o deliveryman queira ver todos os deliveries entregues
    if (req.query.status === 'orders') {
      const deliveries = await Delivery.findAll({
        where: {
          end_date: {
            [Op.ne]: null,
          },
        },
      });

      if (!deliveries) {
        return res.status(400).json({ error: 'Deliveries not founds.' });
      }

      return res.json(deliveries);
    }

    return res.status(400).json({ error: 'invalid status' });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // req.params.deliveryid
    const delivery = await Delivery.findOne({
      where: {
        id: req.params.deliveryid,
        deliveryman_id: req.params.id,
        start_date: null,
      },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not founds.' });
    }

    if (req.body.end_date && !req.body.signature_id) {
      return res.status(400).json({ error: 'Inform the signature_id.' });
    }

    if (req.body.start_date) {
      const { start_date } = req.body;
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

      if (deliveriesCont.length > 4) {
        return res
          .status(400)
          .json({ error: 'You have reached the limit of daily deliveries.' });
      }

      const time = format(parsedDate, 'HH:mm');

      if (time < startDay || time > endDay) {
        return res.status(400).json({ error: 'Invalid time' });
      }
    }

    await delivery.update(req.body);

    // return
    return res.json(delivery);
  }
}

export default new DeliveryStatusController();
