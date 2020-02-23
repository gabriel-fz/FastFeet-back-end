import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryProblem } = data;

    await Mail.sendMail({
      to: `${deliveryProblem.delivery.deliveryman.name} <${deliveryProblem.delivery.deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        deliveryId: deliveryProblem.delivery.id,
        problemDescription: deliveryProblem.description,
        deliverymanName: deliveryProblem.delivery.deliveryman.name,
      },
    });
  }
}

export default new CancellationMail();
