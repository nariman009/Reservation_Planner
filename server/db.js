const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/reservations_db');
const uuid = require('uuid');

const createTables = async()=> {
    const SQL = `
        DROP TABLE IF EXISTS reservations;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS restaurants;
        CREATE TABLE customers(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE restaurants(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE reservations(
            id UUID PRIMARY KEY,
            reservation_date DATE NOT NULL,
            customer_id UUID REFERENCES customers(id) NOT NULL,
            restaurant_id UUID REFERENCES restaurants(id) NOT NULL
        );
    `;
    
    await client.query(SQL);
};

const createCustomer = async({ name })=> {
    const SQL = `
        INSERT INTO customers(id, name)
        VALUES ($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name ]);
    return response.rows[0];
};

const createRestaurant = async({ name })=> {
    const SQL = `
        INSERT INTO restaurants(id, name)
        VALUES ($1, $2)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name ]);
    return response.rows[0];
};

const fetchRestaurants = async()=> {
    const SQL = `
        SELECT *
        FROM restaurants
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchCustomers = async()=> {
    const SQL = `
        SELECT *
        FROM customers
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchReservations = async()=> {
    const SQL = `
        SELECT *
        FROM reservations
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const createReservation = async({ customer_id, restaurant_id, reservation_date })=> {
    const SQL = `
        INSERT INTO reservations(id, customer_id, restaurant_id, reservation_date)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), customer_id, restaurant_id, reservation_date]);
    return response.rows[0];
};

const destroyReservation = async({ id, customer_id}) => {
    console.log(id, customer_id);
    const SQL = `
        DELETE FROM reservations
        WHERE id = $1 AND customer_id=$2
    `;
    await client.query(SQL, [id, customer_id]);
};

module.exports = {
    client,
    createTables,
    createCustomer,
    createReservation,
    createRestaurant,
    fetchRestaurants,
    fetchCustomers,
    fetchReservations,
    destroyReservation
};