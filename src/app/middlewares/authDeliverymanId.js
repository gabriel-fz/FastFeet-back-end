import Deliveryman from '../models/Deliveryman';

export default async (req, res, next) => {
  const { deliverymanid } = req.params;

  if (!deliverymanid) {
    return res.status(400).json({ error: 'Deliverymen id not provided' });
  }

  const deliveryman = await Deliveryman.findByPk(deliverymanid);

  if (!deliveryman) {
    return res.status(404).json({ error: 'Deliveryman not found.' });
  }

  return next();
};
