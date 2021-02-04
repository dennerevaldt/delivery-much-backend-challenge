import { AmqpInterface } from './amqp';
import { HttpInterface } from './http';

import { createContainer as createCoreContainer } from '../core/container';
import { createContainer as createInfraContainer } from '../infrastructure/container';

import { IAmqpInterface, IHttpInterface } from '../types/interface';

type ContainerConfig = {
  env: any;
  init: {
    http?: boolean;
    amqp?: boolean;
  };
};

type Container = {
  httpInterface?: IHttpInterface;
  amqpInterface?: IAmqpInterface;
};

export function createContainer(config: ContainerConfig): Container {
  const container: Container = {};

  const infraContainer = createInfraContainer(config.env);
  const coreContainer = createCoreContainer(infraContainer);

  if (config.init.http) {
    container.httpInterface = new HttpInterface({
      env: config.env,
      coreContainer,
    });
  }

  if (config.init.amqp) {
    container.amqpInterface = new AmqpInterface({
      env: config.env,
      coreContainer,
    });
  }

  return container;
}
