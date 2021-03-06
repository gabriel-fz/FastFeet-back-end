import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import RegisterMail from '../jobs/RegisterMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { name, page = 1 } = req.query;

    const nameProduct = name
      ? {
          product: {
            [Op.iLike]: `%${name}%`,
          },
        }
      : {};

    const deliveries = await Delivery.findAll({
      order: ['id'],
      where: nameProduct,
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      limit: 10,
      offset: (page - 1) * 10,
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
            'city',
            'state',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async show(req, res) {
    const delivery = await Delivery.findByPk(req.params.deliveryid, {
      attributes: ['recipient_id', 'deliveryman_id', 'product'],
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found.' });
    }

    return res.json(delivery);
  }

  async store(req, res) {
    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(404).json({ error: 'Deliveryman not found.' });
    }

    const delivery = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    // envio de email
    await Queue.add(RegisterMail.key, {
      deliverymanExists,
      recipientExists,
      product,
    });

    return res.json(delivery);
  }

  async update(req, res) {
    const delivery = await Delivery.findByPk(req.params.deliveryid);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found.' });
    }

    await delivery.update(req.body);

    return res.json(delivery);
  }

  async delete(req, res) {
    await Delivery.destroy({ where: { id: req.params.deliveryid } });

    return res.json({ ok: true });
  }
}

export default new DeliveryController();
