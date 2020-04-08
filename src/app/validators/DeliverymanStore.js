import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';

export default async (req, res, next) => {
  try {
    // Schema validation:
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.number(),
      email: Yup.string()
        .email()
        .required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    // Validações extras:
    const { email } = req.body;

    const deliverymanExists = await Deliveryman.findOne({
      where: {
        email,
      },
    });

    if (deliverymanExists) {
      throw new Error('Deliveryman exists');
    }

    return next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
