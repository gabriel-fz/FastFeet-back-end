import * as Yup from 'yup';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class DeliveryStatusController {
  async index(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

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
}

export default new DeliveryStatusController();
