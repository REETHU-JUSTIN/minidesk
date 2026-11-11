# MongoDB and Mongoose

The **M** in MERN. These notes use MiniDesk's real code.

---

## Data Modeling: Embedding and Referencing

### 1. Concept Explanation

MongoDB stores **documents**, which are JSON-like objects, in **collections**. There are two ways to connect related data:

- **Embedding:** put the related data inside the document.
- **Referencing:** store the other document's ID, then look it up when needed.

| Question | Embed | Reference |
|---|---|---|
| Is it read together with the parent? | Yes | Not always |
| Does it belong to only one parent? | Yes | No, it's shared |
| Could it grow without limit? | No | Yes |

A single MongoDB document can't exceed 16 MB, which is why unbounded data shouldn't be embedded.

### 2. Project Implementation

- **Comments are embedded** in their ticket, because they belong to it and are read with it.
- **Customers and agents are referenced** from tickets, because each user is shared by many tickets.

### 3. Code Reference

**File:** [backend/src/models/Ticket.ts](../../backend/src/models/Ticket.ts)

```ts
comments: { type: [commentSchema], default: [] },
```

```ts
customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
assignedAgent: { type: Schema.Types.ObjectId, ref: 'User', default: null },
```

- `[commentSchema]` makes comments an array inside the ticket.
- `ObjectId` with `ref` stores only the user's ID, and tells Mongoose which model it points to.

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
await TicketModel.deleteOne({ _id: ticketId })
```

- Deleting a ticket removes its comments too, in one operation, because they're part of the same document.

### 4. Why We Used It

Comments are always shown with their ticket and mean nothing without it, so embedding fits. Users change independently and appear on many tickets. If names were copied onto each ticket, a changed name would need updating everywhere.

### 5. Real-Time Scenario

An admin deletes a ticket with 20 comments. With embedding, that's a single delete, so comments can never be left behind. If Priya later changes her name, every ticket shows the new name automatically, because tickets only hold her ID.

### 6. Interview Questions

- **Theory:** What's the difference between embedding and referencing?
- **Theory:** What's the difference between SQL and NoSQL databases?
- **Theory:** What's the document size limit, and why does it matter?
- **Practical:** How did you design your MongoDB schema?
- **Practical:** Why are comments embedded, but users referenced?

### 7. Project-Based Answers

**Embedding versus referencing?**
Embedding stores related data inside the document, so it's one read. Referencing stores an ID, and needs a second lookup. I embed what's owned and read together, and reference what's shared.

**SQL versus NoSQL?**
SQL databases use tables with a fixed schema and joins. Document databases store flexible documents, and favor keeping related data together. The project was first built on PostgreSQL, then converted to MongoDB, so I've worked with both on the same features.

**Why does the size limit matter?**
A document can't exceed 16 MB. Comments on a support ticket are small and limited in practice, so embedding is safe here. For something unbounded, like event logs, I'd use a separate collection.

**How did you design the schema?**
Two collections, `users` and `tickets`. Tickets embed their comments, and reference their customer and assigned agent by ObjectId.

**Why embedded versus referenced?**
A comment belongs to exactly one ticket and is read with it. A user appears on many tickets, and can change independently.

### 8. Follow-up Questions

- **What if a ticket had thousands of comments?** I'd move them to their own collection with a `ticket` reference and paginate them, because a growing document gets slower to read and write.
- **What do you lose compared with SQL?** The database doesn't enforce references. Nothing stops a ticket from pointing to a deleted user, so the code has to check. `updateTicket` confirms an agent exists before assigning.
- **Do you need transactions?** Single-document operations are atomic. Because comments are embedded, adding or deleting them never spans documents. Multi-document transactions need a replica set.

---

## Mongoose Schemas and Models

### 1. Concept Explanation

MongoDB itself accepts documents of any shape. **Mongoose** is a library that adds structure: a **schema** defines fields, types and rules, and a **model** is the object you use to query a collection.

### 2. Project Implementation

`backend/src/models/` has two models, `User` and `Ticket`. All services use them.

### 3. Code Reference

**File:** [backend/src/models/User.ts](../../backend/src/models/User.ts)

```ts
email: { type: String, required: true, unique: true, lowercase: true },
```

```ts
passwordHash: { type: String, required: true, select: false },
```

```ts
role: { type: String, enum: ['admin', 'agent', 'customer'], default: 'customer', required: true },
```

- `enum` allows only those values.
- `lowercase` normalizes emails before saving.
- `select: false` leaves the hash out of every query, unless one asks for it by name.

**File:** [backend/src/models/Ticket.ts](../../backend/src/models/Ticket.ts)

```ts
{ timestamps: true },
```

- Mongoose fills in `createdAt`, and updates `updatedAt` on every change.

### 4. Why We Used It

Without a schema, a typo could silently store `stauts` instead of `status`. Mongoose validates data before saving, and gives TypeScript-friendly models. It's also what most MERN teams use.

### 5. Real-Time Scenario

A bug tries to save a ticket with a status of `banana`. Mongoose rejects it because of the `enum`, even though MongoDB itself would have accepted it. The API's validators catch this earlier, so this is a second layer of protection.

### 6. Interview Questions

- **Theory:** What is Mongoose, and why use it?
- **Theory:** What's the difference between a schema and a model?
- **Practical:** How do you stop password hashes from being returned?
- **Practical:** Where do you validate data?

### 7. Project-Based Answers

**What is Mongoose?**
An Object Data Modeling library for MongoDB and Node.js. It adds schemas, validation and helpers like `populate`.

**Schema versus model?**
A schema describes a document's shape and rules. A model is built from a schema, and provides methods such as `find` and `create`.

**How do you stop hashes being returned?**
Two layers. The field has `select: false`, so queries leave it out, and login asks for it explicitly with `.select('+passwordHash')`. Every user also goes through `toPublicUser`, which builds a new object with only safe fields.

**Where do you validate?**
In three places: the browser for quick feedback, the API's validators as the real check, and Mongoose schemas as the last line of defense.

### 8. Follow-up Questions

- **Does Mongoose validate updates?** Not by default. `updateOne` skips validators unless you pass `runValidators: true`. In MiniDesk, the API validators check updates first, and `addComment` turns on `runValidators`.
- **What does `lean()` do?** It returns plain objects rather than full Mongoose documents, which is faster when you only read the data.
- **What is an ObjectId?** A 12-byte unique ID, written as 24 hexadecimal characters. It includes a timestamp, so it can be generated without asking the database.

---

## Queries and Populate

### 1. Concept Explanation

MongoDB queries are objects: `{ status: 'open' }` finds documents with that status. Operators start with `$`, like `$regex` and `$set`. **`populate`** is Mongoose's way to replace a stored ID with the referenced document, doing a job similar to a SQL join.

### 2. Project Implementation

`ticketService.ts` handles the ticket list with filters, search, sorting and pagination. `populate` loads customer and agent names.

### 3. Code Reference

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
const filter: Record<string, unknown> = {}
```

```ts
filter.customer = user.id
```

```ts
filter.title = { $regex: escapedSearch, $options: 'i' }
```

```ts
.sort({ [sortField]: -1, _id: -1 })
.skip((page - 1) * limit)
.limit(limit)
.populate(PEOPLE)
```

- Filters are added only when they apply.
- `skip` and `limit` paginate. `_id` is a tiebreak, so the order is stable.
- `populate` fetches users in a single extra query for the whole page, rather than one per ticket.

```ts
await TicketModel.updateOne({ _id: ticketId }, { $set: updates })
```

- `$set` changes only the listed fields. Without it, the document's other fields could be lost.

**File:** [backend/src/services/commentService.ts](../../backend/src/services/commentService.ts)

```ts
{ $push: { comments: { author: user.id, message } } },
```

- `$push` adds to the array in one atomic step, so simultaneous comments can't overwrite each other.

### 4. Why We Used It

Building a filter object suits optional search options. Doing pagination in the database means only one page of tickets is sent to the app, however many exist.

### 5. Real-Time Scenario

A customer searches "invoice" with the status **Open**. The filter becomes their customer ID, a case-insensitive title match, and the status. MongoDB returns one page, `populate` adds the names, and the API sends the result.

### 6. Interview Questions

- **Theory:** What does `populate` do? How is it different from a join?
- **Theory:** What's the difference between `$set` and replacing a document?
- **Practical:** How did you implement search and pagination?
- **Practical:** How do you add a comment safely when two people post at once?

### 7. Project-Based Answers

**What does `populate` do?**
It replaces an ObjectId with the referenced document. Unlike a SQL join, which the database does in one query, `populate` runs a separate query from the application, then combines the results.

**`$set` versus replacing?**
`$set` changes only the named fields. Replacing swaps the whole document, and loses anything not included.

**How did you implement search and pagination?**
I build a filter from the validated options, count matches with `countDocuments`, then use `sort`, `skip` and `limit`. Customers always get their own ID added, whatever they request.

**How do you add a comment safely?**
With `$push`, a single atomic operation. Reading the ticket, adding to the array and saving could lose a comment if two people post together.

### 8. Follow-up Questions

- **Is `skip` good for large collections?** It gets slower as the offset grows, because MongoDB still walks past skipped documents. For very large lists, range-based pagination using the last seen ID is faster.
- **Why does the list exclude comments?** `select('-comments')` avoids loading data the list doesn't show.
- **What's `$regex` performance like?** A case-insensitive search can't use a normal index well. For large data, I'd use a text index or Atlas Search.

---

## Aggregation Pipelines

### 1. Concept Explanation

An aggregation pipeline is a list of stages. Each stage transforms the documents passed to it, then hands the result on.

| Stage | Does |
|---|---|
| `$match` | Filters documents |
| `$group` | Groups and calculates |
| `$project` | Chooses and reshapes fields |
| `$lookup` | Joins another collection |
| `$sort`, `$limit` | Order and limit |

### 2. Project Implementation

`dashboardService.ts` calculates all four dashboard numbers in one pipeline.

### 3. Code Reference

**File:** [backend/src/services/dashboardService.ts](../../backend/src/services/dashboardService.ts)

```ts
const countStatus = (status: string) => ({ $sum: { $cond: [{ $eq: ['$status', status] }, 1, 0] } })
```

```ts
const match = user.role === 'customer' ? { customer: new Types.ObjectId(user.id) } : {}
```

```ts
_id: null,
```

```ts
return stats ?? { total: 0, open: 0, inProgress: 0, resolved: 0 }
```

- `$cond` adds 1 only for matching tickets.
- `_id: null` puts every ticket in a single group.
- Aggregation doesn't convert text to ObjectIds as normal queries do, so this needs `new Types.ObjectId`. Without it, the match would find nothing. A test catches this.
- With no tickets, there are no groups, so `??` supplies zeros.

### 4. Why We Used It

Loading every ticket to count them in JavaScript would get slow and waste memory. The database calculates the numbers and returns one small result.

### 5. Real-Time Scenario

A customer opens the dashboard. `$match` limits the pipeline to their tickets, `$group` calculates four counts in one pass, and `$project` removes `_id`. The API receives a single object with four numbers.

### 6. Interview Questions

- **Theory:** What is an aggregation pipeline?
- **Theory:** Why should `$match` come early?
- **Practical:** How did you build your dashboard statistics?
- **Practical:** Tell me about a tricky bug or detail with aggregation.

### 7. Project-Based Answers

**What is a pipeline?**
A sequence of stages that each transform documents. It's MongoDB's tool for grouping, calculating and reshaping data.

**Why `$match` early?**
It reduces how many documents later stages process, and can use an index.

**How did you build the statistics?**
One pipeline with `$match` for the customer, then `$group` with `_id: null`, using `$sum` and `$cond` for each status.

**A tricky detail?**
Normal Mongoose queries convert a text ID to an ObjectId automatically, but aggregation doesn't. So the customer filter must use `new Types.ObjectId(user.id)`. I confirmed this by removing it: a test failed, because the customer's counts came back as zero.

### 8. Follow-up Questions

- **What does the pipeline return with no tickets?** An empty array, so I fall back to zeros.
- **How would you count by status without fixed fields?** `$group` with `_id: '$status'`, which returns one document per status.
- **What is `$facet`?** It runs several pipelines on the same input. [The MongoDB examples](../../examples/mongodb/README.md) use it for pagination.

---

## Indexes

### 1. Concept Explanation

Without an index, MongoDB reads every document to find matches, called a **collection scan**. An index is a sorted structure that finds them quickly. The cost is extra storage and slightly slower writes. `_id` is always indexed.

### 2. Project Implementation

`users.email` has a unique index. Tickets have indexes for the fields MiniDesk filters and sorts on.

### 3. Code Reference

**File:** [backend/src/models/Ticket.ts](../../backend/src/models/Ticket.ts)

```ts
ticketSchema.index({ customer: 1 })
ticketSchema.index({ assignedAgent: 1 })
ticketSchema.index({ createdAt: -1 })
```

**File:** [backend/src/services/authService.ts](../../backend/src/services/authService.ts)

```ts
if ((error as { code?: number }).code === DUPLICATE_KEY) {
```

- The unique index rejects a duplicate email with error code 11000, which becomes a 409 response.

### 4. Why We Used It

These queries run constantly: every customer loads their tickets. The unique index is also the only reliable way to prevent duplicate emails, because checking first and then inserting leaves a gap for another request.

### 5. Real-Time Scenario

Two people sign up with the same email at the same moment. Both pass any earlier check, but the unique index only lets one insert succeed. A test sends five simultaneous sign-ups, and exactly one wins.

### 6. Interview Questions

- **Theory:** What is an index, and what are the trade-offs?
- **Theory:** What is a compound index?
- **Practical:** How do you guarantee unique emails?
- **Practical:** How do you check whether a query uses an index?

### 7. Project-Based Answers

**What is an index?**
A sorted structure that avoids scanning every document. It costs storage and slows writes slightly, so I only index fields that queries actually use.

**What is a compound index?**
One index on several fields, such as `{ status: 1, createdAt: -1 }`. Field order matters, and it can support queries on its leading fields.

**How do you guarantee unique emails?**
A unique index, then catching error 11000. It also handles simultaneous sign-ups, which a "check first" approach can't.

**How do you check index use?**
With `.explain('executionStats')`. `IXSCAN` means an index was used, and `COLLSCAN` means a full scan.

### 8. Follow-up Questions

- **Who creates the indexes?** Mongoose builds them from the schema. `db:setup` runs `init()` to make sure they're ready.
- **Should you rely on `autoIndex` in production?** Building indexes on large collections can be slow, so large apps often build them separately during deployment.
- **Why index `customer`?** Listing a customer's tickets would otherwise scan the collection.

---

## Security in MongoDB

### 1. Concept Explanation

MongoDB has no SQL, but it has its own form of injection. If a request body like `{ "email": { "$ne": null } }` reaches a query, the object becomes a query **operator**, which can match any user. This is called **NoSQL injection**.

Regular expressions need care too: user text used as a pattern can match more than intended, or be slow.

### 2. Project Implementation

- Validators accept only strings where strings are expected.
- IDs are checked before reaching a query.
- Search text is escaped before being used as a pattern.

### 3. Code Reference

**File:** [backend/src/utils/validators.ts](../../backend/src/utils/validators.ts)

```ts
return typeof value === 'string' ? value.replaceAll('\0', '').trim() : ''
```

```ts
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i
```

- Anything that isn't a string becomes empty text, so an object such as `{ "$ne": null }` can't reach a query.

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```

- Escaping means a search for `.*` looks for those exact characters, rather than matching every ticket.

### 4. Why We Used It

Login is a prime target. If a query accepted `{ "$ne": null }` as an email, an attacker could match accounts without knowing an address.

### 5. Real-Time Scenario

An attacker sends `{ "email": { "$gt": "" }, "password": { "$gt": "" } }` to the login endpoint. The validator sees they aren't strings, and responds with a 400. The query never runs. A test sends exactly this request.

### 6. Interview Questions

- **Theory:** What is NoSQL injection?
- **Theory:** Can a regular expression be a security risk?
- **Practical:** How did you protect your queries?

### 7. Project-Based Answers

**What is NoSQL injection?**
When user input becomes a query operator instead of a value. For example, sending an object containing `$ne` in place of a password field.

**Can a regex be a risk?**
Yes. A pattern from a user can match unintended data, and some patterns take very long to run, which is called ReDoS. I escape search text so it's treated literally, and limit it to 100 characters.

**How did you protect your queries?**
Strict type checks in validators, ID format checks, and escaped search text. My tests send operator objects and regex patterns to confirm they're rejected or treated as plain text.

### 8. Follow-up Questions

- **Does Mongoose stop injection by itself?** Schema casting helps, and it has a `sanitizeFilter` option, but I don't rely on it alone. Validating input at the edge is the main defense.
- **What's the MongoDB equivalent of parameterized queries?** Passing values as typed fields in a query object, and making sure they really are primitive values.
- **How would you secure a production MongoDB?** Turn on authentication, use a user with limited permissions, keep it off the public internet, and use TLS.
