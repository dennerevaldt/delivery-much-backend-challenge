import knex from 'knex';
import { Channel, Options } from 'amqplib';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { IProductRepository } from './product';
import { IOrderRepository } from './order';

export interface IHttpAdapter {
  send(config: AxiosRequestConfig): Promise<AxiosResponse>;
}

/* Http Adapter */
export interface IHttpAdapterConstructs {
  new(config: AxiosRequestConfig): IHttpAdapter;
}

/* MySQL Adapter */
export type MysqlDatabase = knex;

export type MysqlAdapterConfig = {
  dbConn: MysqlDatabase;
};

export interface IMysqlAdapter {
  db: knex.QueryBuilder;
  tableName: string;
}

/* Message Bus Adapter */
export type MessageBus = Channel;
export type MessageContent = unknown;
export type MessagePublishOptions = Options.Publish;

export enum MessageBusType {
  noConfirmation = 0,
  withConfirmation = 1,
}

export type MessageBusAdapterConfig = {
  messageBusType: MessageBusType;
};

export interface IMessageBusAdapter {
  publish(
    router: string,
    routingKey: string,
    content: MessageContent,
    options?: MessagePublishOptions,
  ): Promise<boolean>;
}

export interface IMessageBusAdapterConstructs {
  new(config?: MessageBusAdapterConfig): IMessageBusAdapter;
}

/* Infrastructure */
export type Container = {
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
};

export type ContainerConfig = {};
