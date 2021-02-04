import database from '../../util/knex';

import {
  MysqlDatabase,
  IMysqlAdapter,
  MysqlAdapterConfig,
} from '../../types/infrastructure';

export class MysqlAdapter implements IMysqlAdapter {
  private tbName: string;
  private database: MysqlDatabase;

  constructor(config?: MysqlAdapterConfig) {
    this.database = config?.dbConn || database();
    this.tbName = '';
  }

  get db() {
    return this.database(this.tbName);
  }

  set tableName(name: string) {
    this.tbName = name;
  }
}
