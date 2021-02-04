import winston from 'winston';

const consoleTransport = new winston.transports.Console();

const myWinstonOptions = {
  transports: [consoleTransport]
};

const Logger = winston.createLogger(myWinstonOptions);

export default Logger;
