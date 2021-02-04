import {
  AmqpChannel,
  AmqpMessage,
  FinisherFunction,
} from '../../../types/interface';

export const finisher: FinisherFunction = (
  channel: AmqpChannel,
  message: AmqpMessage,
  error?: unknown,
) => {
  if (error) {
    channel.nack(message);
  } else {
    channel.ack(message);
  }
};
