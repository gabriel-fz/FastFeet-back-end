import { Op } from 'sequelize';
import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';

class RecipientController {
  async store(req, res) {
    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async index(req, res) {
    const nameRecipient = req.query.name
      ? {
          name: {
            [Op.iLike]: `%${req.query.name}%`,
          },
        }
      : {};

    const recipients = await Recipient.findAll({
      order: ['name'],
      where: nameRecipient,
    });

    return res.json(recipients);
  }

  async show(req, res) {
    const recipient = await Recipient.findByPk(req.params.id, {
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
    const recipientExists = await Recipient.findByPk(req.params.id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const newRecipient = await recipientExists.update(req.body);

    return res.json(newRecipient);
  }

  async delete(req, res) {
    const recipientExists = await Recipient.findByPk(req.params.id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const hasDelivery = await Delivery.findOne({
      where: {
        recipient_id: req.params.id,
      },
    });

    if (hasDelivery) {
      return res
        .status(400)
        .json({ error: 'Recipient has a delivery to receive.' });
    }

    await Recipient.destroy({ where: { id: req.params.id } });

    return res.json({ ok: true });
  }
}

export default new RecipientController();
