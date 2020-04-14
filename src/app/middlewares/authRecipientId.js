import Recipient from '../models/Recipient';

export default async (req, res, next) => {
  const { recipientid } = req.params;

  if (!recipientid) {
    return res.status(400).json({ error: 'Recipient id not provided' });
  }

  const recipient = await Recipient.findByPk(recipientid);

  if (!recipient) {
    return res.status(404).json({ error: 'Recipient not found.' });
  }

  return next();
};
