import * as Yup from 'yup';

import Recipient from '../models/Recipient';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      address_number: Yup.number().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string()
        .min(9)
        .max(9)
        .required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    //-------

    const data = req.body;

    const recipientExists = await Recipient.findOne({
      where: data,
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient exists' });
    }

    return next();
  } catch (err) {
    return res.status(400).json({ error: 'Validation fails' });
  }
};
