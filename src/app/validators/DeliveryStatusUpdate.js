import * as Yup from 'yup';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';

export default async (req, res, next) => {
  try {
    // Schema validation:
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    await schema.validate(req.body, { abortEarly: false });

    // Validações extras:
    const { start_date, end_date, signature_id } = req.body;

    // verificando se há o signatura_id junto com o end_date
    if (end_date && !signature_id) {
      throw new Error('Inform the signature_id.');
    }

    if (!end_date && signature_id) {
      throw new Error('Inform the end_date.');
    }

    if (start_date) {
      const parsedDate = parseISO(start_date);
      const startDay = '08:00';
      const endDay = '18:00';

      const deliveriesCont = await Delivery.findAll({
        where: {
          deliveryman_id: req.params.deliverymanid,
          start_date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
      });

      // verificando se o entregador já fez 5 retiradas no dia
      if (deliveriesCont.length > 4) {
        throw new Error('You have reached the limit of daily deliveries.');
      }

      const time = format(parsedDate, 'HH:mm');

      // varificando se a retirada está dentro do horário comercial
      if (time < startDay || time > endDay) {
        throw new Error('Invalid time');
      }
    }

    return next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
