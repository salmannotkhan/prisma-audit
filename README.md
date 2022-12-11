# Prisma Auditing

This example is for database audit logs

> Users are idenfied based on `Authorization` headers

### Setup

```bash
npm install
```

### Running Server

```bash
npm run dev
```

### Making Requests

#### List Users

```bash
curl localhost:3000/users
```

#### Create User

```bash
curl localhost:3000/users \
-X POST \
-H "Authorization: Bearer foo" \
-H "Content-Type: application/json" \
-d '{ "email": "foo@example.com", "name": "John Doe" }'
```

#### Update User

```bash
curl localhost:3000/users/1 \
-X PATCH \
-H "Authorization: Bearer foo" \
-H "Content-Type: application/json" \
-d '{ "name": "Jane Doe" }'
```

#### Delete User

```bash
curl localhost:3000/users/1 \
-X DELETE \
-H "Authorization: Bearer foo"
```
