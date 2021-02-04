import * as amqplib from '../../util/amqplib';

import {
  IMessageBusAdapter,
  MessageBus,
  MessageBusAdapterConfig,
  MessageBusType,
  MessageContent,
  MessagePublishOptions,
} from '../../types/infrastructure';

/**
 * @class MessageBusAdapter
 * @classdesc Is an adapter for message queue communication
 */
export class MessageBusAdapter implements IMessageBusAdapter {
  private messageBus: MessageBus | null;
  private config?: MessageBusAdapterConfig;

  constructor(config?: MessageBusAdapterConfig) {
    this.messageBus = null;
    this.config = config;
  }

  private async getInstance(): Promise<MessageBus> {
    if (this.messageBus === null) {
      switch (this.config?.messageBusType) {
        case MessageBusType.withConfirmation:
          this.messageBus = await amqplib.getConfirmChannel();
          break;
        case MessageBusType.noConfirmation:
        default:
          this.messageBus = await amqplib.getChannel();
          break;
      }
    }

    return this.messageBus;
  }

  // eslint-disable-next-line class-methods-use-this
  private contentToBuffer(content: MessageContent): Buffer {
    switch (typeof content) {
      case 'object':
        return Buffer.from(JSON.stringify(content));
      case 'string':
        return Buffer.from(content, 'utf-8');
      default:
        return Buffer.from('', 'utf-8');
    }
  }

  async publish(
    router: string,
    routingKey: string,
    content: MessageContent,
    options?: MessagePublishOptions,
  ): Promise<boolean> {
    // convert the content to buffer
    const cBuffer = this.contentToBuffer(content);
    const msgBusInstance = await this.getInstance();

    return msgBusInstance
      .publish(router, routingKey, cBuffer, options);
  }
}
