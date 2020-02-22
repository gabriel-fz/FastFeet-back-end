import User from '../models/User';

class UserController {
  async index(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (!userExists) {
      return res.status(400).json({ error: 'User not found.' });
    }
    return res.json(userExists);
  }
}

export default new UserController();
