import * as Yup from 'yup';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

export default async (req, res, next) => {
  try {
    // Schema validation:
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    await schema.validate(req.body, { abortEarly: false });

    // Validações extras:
    const { recipient_id, deliveryman_id } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (recipient_id && !recipientExists) {
      throw new Error('Recipient not found.');
    }

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (deliveryman_id && !deliverymanExists) {
      throw new Error('Deliveryman not found.');
    }

    return next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
