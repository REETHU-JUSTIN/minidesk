// MongoDB CRUD: Create, Read, Update and Delete, using MiniDesk-style tickets.
// Run with: MONGODB_URI=mongodb://localhost:27017 npm run crud
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017'

async function main() {
  const client = new MongoClient(uri)
  await client.connect()

  // A database and collection are created automatically the first time you write to them.
  const db = client.db('minidesk_examples')
  const tickets = db.collection('tickets')
  await tickets.deleteMany({}) // start fresh each run

  // ----- Create -----
  // Documents are JSON-like objects. Unlike SQL rows, they can hold arrays and nested objects,
  // so a ticket can carry its customer's name and its comments inside it.
  await tickets.insertMany([
    {
      ticketNumber: 1001,
      title: 'Cannot download my invoice',
      status: 'open',
      priority: 'high',
      customer: { name: 'Priya Nair', email: 'priya@example.com' },
      comments: [],
      createdAt: new Date('2026-11-01T10:00:00Z'),
    },
    {
      ticketNumber: 1002,
      title: 'App crashes when uploading a file',
      status: 'in_progress',
      priority: 'high',
      customer: { name: 'Liam Walsh', email: 'liam@example.com' },
      assignedAgent: 'Maya Lee',
      comments: [{ author: 'Liam Walsh', message: 'It happens with PDFs over 5 MB.' }],
      createdAt: new Date('2026-11-02T10:00:00Z'),
    },
    {
      ticketNumber: 1003,
      title: 'How do I change my billing address?',
      status: 'resolved',
      priority: 'low',
      customer: { name: 'Priya Nair', email: 'priya@example.com' },
      assignedAgent: 'Sam Carter',
      comments: [],
      createdAt: new Date('2026-11-03T10:00:00Z'),
    },
  ])
  console.log('Inserted:', await tickets.countDocuments(), 'tickets')

  // An index makes lookups by these fields fast, like a SQL index.
  await tickets.createIndex({ status: 1, createdAt: -1 })

  // ----- Read -----
  // A filter is an object. { status: 'open' } is like SQL's WHERE status = 'open'.
  const openTickets = await tickets.find({ status: 'open' }).toArray()
  console.log('Open:', openTickets.map((t) => t.ticketNumber))

  // Operators start with $. Dot notation reaches into nested objects.
  // The projection picks fields, like listing columns after SELECT.
  const priyasActive = await tickets
    .find(
      { 'customer.email': 'priya@example.com', status: { $in: ['open', 'in_progress'] } },
      { projection: { _id: 0, ticketNumber: 1, title: 1 } },
    )
    .sort({ createdAt: -1 })
    .toArray()
  console.log("Priya's active tickets:", priyasActive)

  // Case-insensitive search, like ILIKE '%crash%'
  const search = await tickets.find({ title: { $regex: 'crash', $options: 'i' } }).toArray()
  console.log('Search "crash":', search.map((t) => t.title))

  // ----- Update -----
  // $set changes fields. Without it, updateOne would replace the whole document.
  const assigned = await tickets.updateOne(
    { ticketNumber: 1001 },
    { $set: { status: 'in_progress', assignedAgent: 'Sam Carter', updatedAt: new Date() } },
  )
  console.log('Assigned 1001, documents changed:', assigned.modifiedCount)

  // $push adds to an array inside the document. In MiniDesk, this is a separate comments table.
  await tickets.updateOne({ ticketNumber: 1001 }, { $push: { comments: { author: 'Sam Carter', message: 'Looking into it now.' } } })
  const updated = await tickets.findOne({ ticketNumber: 1001 }, { projection: { _id: 0, status: 1, assignedAgent: 1, comments: 1 } })
  console.log('Ticket 1001 now:', JSON.stringify(updated))

  // ----- Delete -----
  const deleted = await tickets.deleteOne({ ticketNumber: 1003 })
  console.log('Deleted 1003:', deleted.deletedCount, '| remaining:', await tickets.countDocuments())

  await client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
