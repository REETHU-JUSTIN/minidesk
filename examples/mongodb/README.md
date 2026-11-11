# MongoDB: CRUD and Aggregation

**Tested:** both scripts ran correctly against a temporary MongoDB server. These use the plain MongoDB driver, while MiniDesk uses Mongoose, so you can compare the two. MiniDesk's own design is explained in [MongoDB and Mongoose](../../docs/interview/mongodb.md).

## Run it

You need a MongoDB server, either installed locally or a free hosted database such as MongoDB Atlas.

```bash
cd examples/mongodb
npm install
MONGODB_URI=mongodb://localhost:27017 npm run crud
MONGODB_URI=mongodb://localhost:27017 npm run aggregation
```

In PowerShell, set the variable first with `$env:MONGODB_URI = "mongodb://localhost:27017"`. The scripts only touch a database called `minidesk_examples`.

---

## MongoDB CRUD

### 1. Concept Explanation

MongoDB is a **document database**. Instead of tables with fixed columns, it stores JSON-like documents in collections. A document can hold nested objects and arrays, and documents in the same collection don't need identical fields.

| SQL | MongoDB |
|---|---|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| `JOIN` | Embedding, or `$lookup` |
| `WHERE status = 'open'` | `{ status: 'open' }` |

### 2. Project Implementation

`crud.js` stores MiniDesk-style tickets with the customer and comments **embedded** inside each ticket. MiniDesk embeds comments too, but references customers.

### 3. Code Reference

**File:** [examples/mongodb/crud.js](crud.js)

```js
const openTickets = await tickets.find({ status: 'open' }).toArray()
```

```js
{ 'customer.email': 'priya@example.com', status: { $in: ['open', 'in_progress'] } },
```

```js
await tickets.updateOne({ ticketNumber: 1001 }, { $push: { comments: { author: 'Sam Carter', message: 'Looking into it now.' } } })
```

- A filter is an object, and operators start with `$`.
- Dot notation, as in `'customer.email'`, reaches into nested objects.
- `$push` adds to an array inside the document, which is how MiniDesk adds comments.
- Without `$set`, `updateOne` would replace the whole document.

### 4. Why Use It

A document can match how the app uses its data, so reading a ticket with its comments is one lookup with no joins. Flexible fields also suit data that varies a lot between records.

### 5. Real-Time Scenario

With this script's design, opening a ticket reads one document, already containing its comments and customer. The trade-off: if a customer changed their name, every ticket with a copy of that name would need updating. That's why MiniDesk embeds comments, but references customers by ID.

### 6. Interview Questions

- **Theory:** What's the difference between SQL and NoSQL databases?
- **Theory:** When would you embed data, and when would you reference it?
- **Practical:** Why did you convert MiniDesk from PostgreSQL to MongoDB?
- **Practical:** What's the difference between the MongoDB driver and Mongoose?

### 7. Project-Based Answers

**SQL versus NoSQL?**
SQL databases use tables with a fixed schema, relationships and joins, and strong consistency. Document databases like MongoDB store flexible JSON-like documents, and favor reading related data together.

**Embed or reference?**
Embed data that's read together and owned by the parent, like a ticket's comments. Reference data that's shared or grows without limit, like users. My aggregation example references agents by ID, then joins them with `$lookup`.

**Why did you convert it?**
I'm focusing on the MERN stack, so I wanted real MongoDB experience. Building the same features on both databases taught me the trade-offs: PostgreSQL enforced relationships for me, while MongoDB let me embed comments and needed the code to check references.

**Driver versus Mongoose?**
The driver, used in these scripts, talks to MongoDB directly with no schema. Mongoose adds schemas, validation and `populate`, which MiniDesk uses.

### 8. Follow-up Questions

- **What is `_id`?** A unique identifier MongoDB adds to every document, an ObjectId by default.
- **Does MongoDB have indexes?** Yes. `crud.js` creates one with `createIndex` on status and date.
- **Does MongoDB support transactions?** Yes, across multiple documents, but modeling so that related data sits in one document often avoids needing them.

---

## MongoDB Aggregation

### 1. Concept Explanation

An aggregation **pipeline** is a list of stages. Each stage transforms the documents passed to it, and hands the result to the next stage.

| Stage | Does | SQL equivalent |
|---|---|---|
| `$match` | Filters documents | `WHERE` |
| `$group` | Groups and calculates | `GROUP BY` |
| `$lookup` | Joins another collection | `LEFT JOIN` |
| `$unwind` | Turns an array into separate documents | No direct equivalent |
| `$project` | Chooses and reshapes fields | `SELECT` list |
| `$sort`, `$skip`, `$limit` | Order and paginate | `ORDER BY`, `OFFSET`, `LIMIT` |
| `$facet` | Runs several pipelines on the same input | Several queries |

### 2. Project Implementation

`aggregation.js` runs MiniDesk-style reports with the plain driver: counts by status, the dashboard numbers, agent workload with names joined in, and a page of tickets with a total.

### 3. Code Reference

**File:** [examples/mongodb/aggregation.js](aggregation.js)

```js
{ $group: { _id: '$status', count: { $sum: 1 } } },
```

```js
open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
```

```js
{ $lookup: { from: 'agents', localField: '_id', foreignField: '_id', as: 'agent' } },
```

- `_id` in `$group` is what to group by. `$status` with a `$` means "the value of the status field".
- `$cond` adds 1 only for matching documents. MiniDesk's dashboard works the same way.
- `$lookup` always produces an array, which `$unwind` then flattens.

### 4. Why Use It

It does the calculation in the database, rather than downloading every document to count them in code.

### 5. Real-Time Scenario

To show each agent's workload, the pipeline filters out resolved tickets, groups by agent, joins agent names, then sorts. The result is two short documents, rather than every ticket.

### 6. Interview Questions

- **Theory:** What is an aggregation pipeline?
- **Theory:** Why does stage order matter?
- **Practical:** How would you calculate MiniDesk's dashboard numbers with an aggregation?

### 7. Project-Based Answers

**What is a pipeline?**
A sequence of stages that each transform documents. It's MongoDB's equivalent of SQL's `WHERE`, `GROUP BY`, `JOIN` and `ORDER BY`.

**Why does order matter?**
Each stage only sees the previous stage's output. Putting `$match` first reduces the documents everything else processes, and can use an index.

**Translate the dashboard query.**
One `$group` with `_id: null`, so all documents form a single group, and a `$sum` of `$cond` for each status. MiniDesk's `dashboardService.js` does this.

### 8. Follow-up Questions

- **Is `$lookup` as efficient as a SQL join?** It works, but MongoDB is designed for embedding. Heavy use of `$lookup` is often a sign the data is relational.
- **How does `$facet` help pagination?** It returns one page and the total count from a single query.
- **What's the aggregation equivalent of `HAVING`?** A `$match` placed after `$group`.
