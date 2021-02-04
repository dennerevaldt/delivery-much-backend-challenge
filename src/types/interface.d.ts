import {
  Router,
  Request,
  Response,
  NextFunction,
} from 'express';
import { Channel, ConsumeMessage } from 'amqplib';

import { Container } from './core';

import { FuncHandler } from '../interface/amqp/middlewares/handlers';

/* HTTP Interface */
export type HttpRouter = Router;
export type HttpRequest = Request;
export type HttpResponse = Response;
export type HttpNext = NextFunction;

/* AMQP Interface */
export type AmqpChannel = Channel;
export type AmqpMessage = ConsumeMessage;
export type AmqpParsedMessage<T> = Record<'content', T | undefined> & AmqpMessage;
export type AmqpMessageHandler = (msg: AmqpMessage | null) => void | Promise<void>;

export type FinisherFunction = (channel: AmqpChannel, message: AmqpMessage, error?: unknown) => unknown;

export type AmqpOnConsumeFunction = (
  channel: AmqpChannel,
  finisher: FinisherFunction,
  ...msgHandlers: FuncHandler[],
) => (message: AmqpMessage | null) => Promise<void>;

export interface IHttpInterface {
  serve(): void;
}

export type HttpControllerConfig = {
  // eslint-disable-next-line no-undef
  validator: typeof import('../interface/http/middleware/validator').validator;
  coreContainer: Container;
};

export interface IHttpRoute {
  // eslint-disable-next-line no-unused-vars
  register(router: HttpRouter): void;
}

export interface IAmqpInterface {
  connect(): Promise<void>;
}

export interface IAmqpConsumer {
  assertQueue(channel: AmqpChannel): Promise<void>;
}

export type AmqpConsumerConfig = {
  coreContainer: Container;
  onConsume: AmqpOnConsumeFunction;
};
