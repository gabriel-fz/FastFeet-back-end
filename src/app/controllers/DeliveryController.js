import * as Yup from 'yup';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import RegisterMail from '../jobs/RegisterMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const nameProduct = req.query.name
      ? {
          product: {
            [Op.iLike]: `%${req.query.name}%`,
          },
        }
      : {};

    const deliveries = await Delivery.findAll({
      order: ['id'],
      where: nameProduct,
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
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
    const delivery = await Delivery.findByPk(req.params.id, {
      attributes: ['recipient_id', 'deliveryman_id', 'product'],
    });

    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
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
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (recipient_id && !recipientExists) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (deliveryman_id && !deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found.' });
    }

    await delivery.update(req.body);

    return res.json(delivery);
  }

  async delete(req, res) {
    const deliveryExists = await Delivery.findByPk(req.params.id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery not found.' });
    }

    await Delivery.destroy({ where: { id: req.params.id } });

    return res.json({ ok: true });
  }
}

export default new DeliveryController();
