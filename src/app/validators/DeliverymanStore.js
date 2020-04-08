import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.number(),
      email: Yup.string()
        .email()
        .required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    const { email } = req.body;

    const deliverymanExists = await Deliveryman.findOne({
      where: {
        email,
      },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman exists' });
    }

    return next();
  } catch (err) {
    return res.status(400).json({ error: 'Validation fails' });
  }
};
