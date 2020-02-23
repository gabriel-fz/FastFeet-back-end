import Mail from '../../lib/Mail';

class RegisterMail {
  get key() {
    return 'RegisterMail';
  }

  async handle({ data }) {
    const { deliverymanExists, recipientExists, product } = data;

    await Mail.sendMail({
      to: `${deliverymanExists.name} <${deliverymanExists.email}>`,
      subject: 'Nova entrega',
      template: 'register',
      context: {
        deliveryman: deliverymanExists.name,
        recipient: recipientExists.name,
        address: recipientExists.address,
        address_number: recipientExists.address_number,
        complement: recipientExists.complement,
        product,
      },
    });
  }
}

export default new RegisterMail();
