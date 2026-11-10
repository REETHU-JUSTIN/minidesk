// MongoDB aggregation: a pipeline of stages, where each stage transforms the documents
// passed to it. Comparable to SQL's WHERE, GROUP BY, JOIN and ORDER BY.
// Run with: MONGODB_URI=mongodb://localhost:27017 npm run aggregation
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017'

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db('minidesk_examples')

  // This time, tickets reference agents by ID instead of copying their names,
  // so the $lookup example below has something to join.
  const agents = db.collection('agents')
  const tickets = db.collection('tickets_with_refs')
  await agents.deleteMany({})
  await tickets.deleteMany({})

  const { insertedIds } = await agents.insertMany([{ name: 'Sam Carter' }, { name: 'Maya Lee' }])
  const sam = insertedIds[0]
  const maya = insertedIds[1]

  await tickets.insertMany([
    { title: 'Invoice missing', status: 'open', priority: 'high', agentId: sam },
    { title: 'Upload crashes', status: 'in_progress', priority: 'high', agentId: maya },
    { title: 'Charged twice', status: 'in_progress', priority: 'high', agentId: sam },
    { title: 'Change address', status: 'resolved', priority: 'low', agentId: sam },
    { title: 'Export missing a column', status: 'open', priority: 'low', agentId: null },
  ])

  // 1. Count tickets by status: like SELECT status, COUNT(*) ... GROUP BY status
  const byStatus = await tickets
    .aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ])
    .toArray()
  console.log('By status:', byStatus)

  // 2. The dashboard's four numbers in one result, like COUNT(*) FILTER (WHERE ...)
  const [stats] = await tickets
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ])
    .toArray()
  console.log('Dashboard stats:', stats)

  // 3. Each agent's unresolved workload, with names joined in.
  //    $match is WHERE, $lookup is a LEFT JOIN, and $unwind turns the joined array into fields.
  const workload = await tickets
    .aggregate([
      { $match: { status: { $ne: 'resolved' }, agentId: { $ne: null } } },
      { $group: { _id: '$agentId', activeTickets: { $sum: 1 }, titles: { $push: '$title' } } },
      { $lookup: { from: 'agents', localField: '_id', foreignField: '_id', as: 'agent' } },
      { $unwind: '$agent' },
      { $project: { _id: 0, agent: '$agent.name', activeTickets: 1, titles: 1 } },
      { $sort: { activeTickets: -1 } },
    ])
    .toArray()
  console.log('Agent workload:', JSON.stringify(workload))

  // 4. Pagination and a total in one query, like MiniDesk's ticket list.
  //    $facet runs several pipelines on the same documents.
  const [page] = await tickets
    .aggregate([
      { $sort: { title: 1 } },
      {
        $facet: {
          items: [{ $skip: 0 }, { $limit: 2 }, { $project: { _id: 0, title: 1 } }],
          total: [{ $count: 'count' }],
        },
      },
    ])
    .toArray()
  console.log('Page 1:', page.items.map((t) => t.title), '| total:', page.total[0].count)

  await client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
