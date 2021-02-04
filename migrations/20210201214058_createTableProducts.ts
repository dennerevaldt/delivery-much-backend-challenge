import * as Knex from 'knex';
import csvtojson from 'csvtojson';
import path from 'path';

const productsCsv = path.join(__dirname, '..', 'configs', 'products.csv');
const TABLE_NAME = 'products';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').unsigned().notNullable();
    t.string('name').notNullable().unique();
    t.integer('quantity').notNullable().defaultTo(0);
    t.decimal('price', 10, 2).notNullable();
  });

  const productsJson = await csvtojson().fromFile(productsCsv);

  const productsToInsert = productsJson.map((product) => ({
    name: product.name,
    quantity: parseInt(product.quantity),
    price: parseFloat(product.price),
  }));

  return knex(TABLE_NAME).insert(productsToInsert);
}

export async function down(knex: Knex): Promise<void> {
  await knex(TABLE_NAME).delete();
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
