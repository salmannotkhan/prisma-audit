import { Prisma, PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'
import express from 'express'

function fetchUser(token: string) {
  const users: Record<string, string> = {
    foo: "User 1",
    bar: "User 2",
    baz: "User 3"
  }
  return users[token]
}
const userContext = new AsyncLocalStorage<string>()
const prisma = new PrismaClient()

// Auditing middleware
prisma.$use(async (params, next) => {
  const { action, model, args } = params
  const actionMap: Record<string, string> = {
    'create': 'created',
    'createMany': 'created',
    'update': "updated",
    'updateMany': "updated",
    'upsert': "upserted",
    'delete': "deleted",
    'deleteMany': "deleted",
  }
  if (action in actionMap) {
    const user = userContext.getStore()
    const result = await next(params)
    console.log("Timestamp:", new Date().toISOString())
    let actionString
    const data = JSON.stringify(args.data)
    const where = JSON.stringify(args.where)
    if (actionMap[action] === "updated") {
      actionString = `with ${data} where ${where}`
    } else if (actionMap[action] === "deleted") {
      actionString = `where ${where}`
    } else {
      actionString = `with ${data}`
    }
    console.log(user, actionMap[action], model, actionString)
    console.log()
    return result
  } 
  return next(params)
})

const app = express()
app.use(express.json())

// Attaching User Context
app.use((req, _res, next) => {
  if ("authorization" in req.headers) {
    const token = req.headers.authorization?.split(" ")[1] || ""
    const user = fetchUser(token)
    userContext.run(user, () => next())
    return
  }
  next()
})

app.post(`/users`, async (req, res) => {
  const { name, email} = req.body

  const result = await prisma.user.create({
    data: {
      name,
      email,
    },
  })
  return res.status(201).json(result)
})

app.patch('/users/:id', async (req, res) =>{
  const { id } = req.params
  const { name, email} = req.body

  const result = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      name,
      email,
    },
  })
  return res.status(200).json(result)
})

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params
  const users = await prisma.user.delete({
    where: { id: Number(id) }
  })
  return res.status(200).json(users)
})

app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany()
  console.log(users)
  return res.status(200).json(users)
})


app.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`)
)
