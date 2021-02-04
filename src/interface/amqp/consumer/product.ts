import R from 'ramda';

import { parseMessage } from '../middlewares/parse';
import { processProductNotificationSchema } from './schemas/product';
import { validator } from '../middlewares/validator';
import Logger from '../../../util/logger';

import {
  AmqpChannel,
  IAmqpConsumer,
  AmqpConsumerConfig,
  AmqpMessage,
  AmqpMessageHandler,
  AmqpParsedMessage,
} from '../../../types/interface';
import { Product } from '../../../types/product';

export class ProductConsumer implements IAmqpConsumer {
  private productUseCase: AmqpConsumerConfig['coreContainer']['productUseCase'];
  private onConsume: AmqpConsumerConfig['onConsume'];

  constructor({ coreContainer, onConsume }: AmqpConsumerConfig) {
    this.productUseCase = coreContainer.productUseCase;
    this.onConsume = onConsume;
  }

  async assertQueue(channel: AmqpChannel): Promise<void> {
    await channel.assertQueue('products', { durable: true });
    await channel.bindQueue('products', 'stock', 'incremented');
    await channel.bindQueue('products', 'stock', 'decremented');
    channel.consume(
      'products',
      this.onConsume(
        channel,
        this.finisher.bind(this),
        this.processProductNotification.bind(this) as AmqpMessageHandler,
      ),
    );
  }

  async processProductNotification(msg: AmqpMessage): Promise<void> {
    const { routingKey } = msg.fields;
    let parsedMessage;

    switch (routingKey) {
      case 'incremented':
        parsedMessage = parseMessage<string>(R.__)(msg) as AmqpParsedMessage<string>;
        validator(processProductNotificationSchema, parsedMessage);
        this.processIncrementedProduct(parsedMessage);
        break;
      case 'decremented':
        parsedMessage = parseMessage<string>(R.__)(msg) as AmqpParsedMessage<string>;
        validator(processProductNotificationSchema, parsedMessage);
        this.processDecrementedProduct(parsedMessage);
        break;
      default:
        Logger.error('invalid routing key', routingKey);
        break;
    }
  }

  processIncrementedProduct(msg: AmqpParsedMessage<string>) {
    const { content } = msg;
    this.productUseCase.incrementProductInStock({ name: content as string } as Product);
  }

  async processDecrementedProduct(msg: AmqpParsedMessage<string>) {
    const { content } = msg;
    this.productUseCase.decrementProductInStock({ name: content as string } as Product);
  }

  // eslint-disable-next-line class-methods-use-this
  private finisher(
    channel: AmqpChannel, message: AmqpMessage, err?: unknown,
  ): void {
    if (err) {
      Logger.error({ error: err });
    }
    channel.ack(message);
  }
}
