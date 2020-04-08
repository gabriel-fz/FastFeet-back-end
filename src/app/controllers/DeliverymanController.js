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
    const deliveryman = await Deliveryman.findByPk(req.params.deliverymanid, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found.' });
    }

    return res.json(deliveryman);
  }

  async store(req, res) {
    const deliveryman = await Deliveryman.create(req.body);

    return res.json(deliveryman);
  }

  async update(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.deliverymanid);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    const deliverymanUpdate = await deliveryman.update(req.body);

    return res.json({ deliverymanUpdate });
  }

  async delete(req, res) {
    await Deliveryman.destroy({ where: { id: req.params.deliverymanid } });

    return res.json({ ok: true });
  }
}

export default new DeliverymanController();
