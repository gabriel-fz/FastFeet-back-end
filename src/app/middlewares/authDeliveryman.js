import Deliveryman from '../models/Deliveryman';

export default async (req, res, next) => {
  const deliverymenId = req.params.id;

  if (!deliverymenId) {
    return res.status(401).json({ error: 'Deliverymen id not provided' });
  }

  const deliveryman = await Deliveryman.findByPk(deliverymenId);

  if (!deliveryman) {
    return res.status(401).json({ error: 'Deliveryman no exists' });
  }

  return next();
};
