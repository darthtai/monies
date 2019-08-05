# Dependencies

- [Node.js](https://nodejs.org/en/download/) v10.7
- [npm](https://www.npmjs.com/get-npm) v6.1
- [Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/) v18.06
- [Docker Compose](https://docs.docker.com/compose/install/) v1.22

## Running development

```
npm start
```

Connect to the container

```
docker exec -ti monies_monies_1 bash
```

Run migrations

```
./node_modules/.bin/sequelize db:migrate
```

Seed admin account

```
./node_modules/.bin/sequelize db:seed:all
```

To create an account:


```
POST http://localhost:3000/user body: { name: 'name', email: 'email@mail.com', password: 'test123' }
```
Include access_level in body if you would like to change access level ('admin' for admin).

To create transactions:

```
POST http://localhost:3000/transactions body: { "number": "1234 5678 9876 5432", "bearer_name": "bobby bob", "cvv": "1245", "valid_date": "2019-12-12", "value": 6554.52, "payment_method": "credit_card", "description": "machine thingy" }
```
Include taxes array if you would like to include taxes in payable calculation with type 'percent' or 'base' ex: taxes: [ { name: 'IOF', value: 0.1, type: 'percent' } ]

To delete transactions (must have admin access):

```
DELETE http://localhost:3000/transactions/:transactionID
```

To get user transactions:

```
GET http://localhost:3000/transactions
```

To get payables:

```
GET http://localhost:3000/payables
```
Include clientId in query string if access level admin to select specific client payables. Include status string query with either 'paid' or 'waiting_funds' to filter by status (regardless of access level).

## Tests

```
npm test
```
