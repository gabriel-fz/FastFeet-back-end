import Deliveryman from '../models/Deliveryman';

export default async (req, res, next) => {
  const { deliverymanid } = req.params;

  if (!deliverymanid) {
    return res.status(401).json({ error: 'Deliverymen id not provided' });
  }

  const deliveryman = await Deliveryman.findByPk(deliverymanid);

  if (!deliveryman) {
    return res.status(401).json({ error: 'Deliveryman no exists' });
  }

  return next();
};
