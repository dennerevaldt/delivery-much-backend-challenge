import * as Knex from 'knex';

const TABLE_NAME = 'orders';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').unsigned().notNullable();
    t.json('products').notNullable();
    t.decimal('total', 10, 2).notNullable().defaultTo(0);
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}

