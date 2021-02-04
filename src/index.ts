import { env } from './util/env';
import Logger from './util/logger';

import { createContainer } from './interface/container';

type AppConfig = {
  http?: boolean;
  amqp?: boolean;
};

export class App {
  private http?: boolean;
  private amqp?: boolean;

  constructor({ http, amqp }: AppConfig) {
    this.http = http;
    this.amqp = amqp;
  }

  run() {
    const interfaceContainer = createContainer({
      env,
      init: {
        http: this.http,
        amqp: this.amqp,
      },
    });

    if (this.amqp) {
      interfaceContainer.amqpInterface?.connect();
    }

    if (this.http) {
      interfaceContainer.httpInterface?.serve();
    }
  }
}

const app = new App({
  http: env.httpActive,
  amqp: env.amqpActive,
});

setImmediate(() => {
  app.run();
  Logger.debug('app initialized');
});
