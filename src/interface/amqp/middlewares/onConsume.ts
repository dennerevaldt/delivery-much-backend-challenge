import { applyHandlers, FuncHandler } from './handlers';
import Logger from '../../../util/logger';

import {
  AmqpChannel,
  AmqpMessage,
  AmqpMessageHandler,
  AmqpOnConsumeFunction,
  FinisherFunction,
} from '../../../types/interface';

export const onConsume: AmqpOnConsumeFunction = (
  channel: AmqpChannel,
  finisher: FinisherFunction,
  ...msgHandlers: FuncHandler[]
) => {
  return async (message: AmqpMessage | null): Promise<void> => {
    let error = null;

    try {
      const handle = applyHandlers(msgHandlers) as AmqpMessageHandler;
      await handle(message);
    } catch (err) {
      error = err;
      Logger.error({ message: 'consume_message_failed', error });
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      finisher(channel, message!, error);
    }
  };
};
