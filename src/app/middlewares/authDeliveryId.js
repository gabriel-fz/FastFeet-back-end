import Delivery from '../models/Delivery';

export default async (req, res, next) => {
  const { deliveryid } = req.params;

  if (!deliveryid) {
    return res.status(401).json({ error: 'Delivery id not provided' });
  }

  const delivery = await Delivery.findByPk(deliveryid);

  if (!delivery) {
    return res.status(401).json({ error: 'Delivery not found.' });
  }

  return next();
};
