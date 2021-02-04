import { ProductConsumer } from './consumer/product';
import { getChannel } from '../../util/amqplib';
import { onConsume } from './middlewares/onConsume';
import Logger from '../../util/logger';
import { env } from '../../util/env';

import {
  IAmqpConsumer,
  AmqpChannel,
  IAmqpInterface,
} from '../../types/interface';
import { Container } from '../../types/core';

type Config = {
  env: typeof env;
  coreContainer: Container;
};

export class AmqpInterface implements IAmqpInterface {
  private env: Config['env'];
  private coreContainer: Config['coreContainer'];
  private channel: AmqpChannel | null;

  constructor(config: Config) {
    this.env = config.env;
    this.coreContainer = config.coreContainer;
    this.channel = null;
  }

  private async getChannel(): Promise<AmqpChannel> {
    if (this.channel === null) {
      this.channel = await getChannel();
    }
    return this.channel;
  }

  private async connectConsumers(): Promise<void> {
    const channel = await this.getChannel();

    [
      new ProductConsumer({
        coreContainer: this.coreContainer,
        onConsume,
      }),
    ]
      .forEach((consumer: IAmqpConsumer) => {
        consumer.assertQueue(channel).then();
      });
  }

  async connect(): Promise<void> {
    try {
      await this.connectConsumers();
      Logger.debug('amqp interface initialized');
    } catch (error) {
      Logger.debug('amqp interface fail');
      process.exit(1);
    }
  }
}
