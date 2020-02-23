import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import Mail from '../../lib/Mail';

class DeliveryController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      order: ['id'],
    });

    return res.json(deliveries);
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
    await Mail.sendMail({
      to: `${deliverymanExists.name} <${deliverymanExists.email}>`,
      subject: 'Nova entrega',
      text: 'Você tem uma nova entrega',
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
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found.' });
    }

    if (delivery.start_date) {
      return res.status(401).json({ error: 'Impossible to cancel delivery' });
    }

    delivery.canceled_at = new Date();

    await delivery.save();

    return res.json({ ok: true });
  }
}

export default new DeliveryController();
