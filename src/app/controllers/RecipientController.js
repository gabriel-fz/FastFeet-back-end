import { Op } from 'sequelize';
import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';

class RecipientController {
  async store(req, res) {
    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async index(req, res) {
    const { name, page = 1 } = req.query;
    const nameRecipient = name
      ? {
          name: {
            [Op.iLike]: `%${name}%`,
          },
        }
      : {};

    const recipients = await Recipient.findAll({
      order: ['name'],
      where: nameRecipient,
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(recipients);
  }

  async show(req, res) {
    const recipient = await Recipient.findByPk(req.params.recipientid, {
      attributes: [
        'name',
        'address',
        'address_number',
        'complement',
        'city',
        'state',
        'zip_code',
      ],
    });

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    return res.json(recipient);
  }

  async update(req, res) {
    const recipient = await Recipient.findByPk(req.params.recipientid);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const newRecipient = await recipient.update(req.body);

    return res.json(newRecipient);
  }

  async delete(req, res) {
    const hasDelivery = await Delivery.findOne({
      where: {
        recipient_id: req.params.recipientid,
      },
    });

    if (hasDelivery) {
      return res
        .status(400)
        .json({ error: 'Recipient has a delivery to receive.' });
    }

    await Recipient.destroy({ where: { id: req.params.recipientid } });

    return res.json({ ok: true });
  }
}

export default new RecipientController();
