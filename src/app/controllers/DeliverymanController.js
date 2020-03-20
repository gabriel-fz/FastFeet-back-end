import * as Yup from 'yup';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const nameDeliveryman = req.query.name
      ? {
          name: {
            [Op.iLike]: `%${req.query.name}%`,
          },
        }
      : {};

    const deliverymans = await Deliveryman.findAll({
      order: ['name'],
      where: nameDeliveryman,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymans);
  }

  async show(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'deliveryman not found.' });
    }

    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.number(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveryman = await Deliveryman.create(req.body);

    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      avatar_id: Yup.number(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    const deliverymanUpdate = await deliveryman.update(req.body);

    return res.json({ deliverymanUpdate });
  }

  async delete(req, res) {
    const deliverymanExists = await Deliveryman.findByPk(req.params.id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    await Deliveryman.destroy({ where: { id: req.params.id } });

    return res.json({ ok: true });
  }
}

export default new DeliverymanController();
