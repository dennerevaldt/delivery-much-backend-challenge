import { MysqlAdapter } from '../mysql';

import { MysqlDatabase } from '../../../types/infrastructure';

describe('mysql adapter', () => {
  it('constructs with all properties', () => {
    const t = new MysqlAdapter({
      dbConn: jest.fn() as unknown as MysqlDatabase,
    });

    expect(t).toBeDefined();
  });

  it('sets the table name', () => {
    const dbConn = jest.fn() as unknown as MysqlDatabase;
    const t = new MysqlAdapter({
      dbConn,
    });

    t.tableName = 'testTable';

    const x = t.db;
    // @ts-ignore
    expect(dbConn.mock.calls).toEqual([['testTable']]);
  });
});
