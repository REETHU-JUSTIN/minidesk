# Authentication and Authorization

---

## Password Hashing with bcrypt

### 1. Concept Explanation

Passwords must never be stored as plain text. **Hashing** turns a password into a fixed string that can't be reversed. Logging in hashes the attempt and compares the results.

Fast hashes aren't suitable, because attackers can try billions of guesses per second. **bcrypt** is deliberately slow, and adds a random **salt** so that identical passwords produce different hashes. The salt is stored inside the hash.

### 2. Project Implementation

`authService.ts` hashes on sign-up and compares on login. Only the login query reads the hash, and every other query lists safe columns by name.

### 3. Code Reference

**File:** [backend/src/services/authService.ts](../../backend/src/services/authService.ts)

```ts
const SALT_ROUNDS = 10
```

```ts
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
```

```ts
const passwordMatches = await bcrypt.compare(password, foundUser?.passwordHash ?? unusedPasswordHash)
```

```ts
export const PUBLIC_USER_COLUMNS = 'id, name, email, role, created_at AS "createdAt"'
```

```ts
const { passwordHash: _passwordHash, ...user } = foundUser
```

- Each increase in rounds doubles the work.
- When an email doesn't exist, `compare` still runs against a dummy hash, so response time doesn't reveal which emails have accounts.
- Queries list safe columns by name, so `password_hash` can't be returned by accident.
- Login is the one query that needs the hash, and rest syntax removes it before the user is returned.

### 4. Why We Used It

If a database leaks, hashes protect people, many of whom reuse passwords. bcrypt's slowness makes guessing costly, and its salt defeats precomputed tables of hashes.

### 5. Real-Time Scenario

Priya signs up. Her password is hashed and only the hash is kept. When she logs in, `compare` reads the salt from the stored hash, hashes her attempt the same way, and compares them. Nobody, including the team running the database, can read her password.

### 6. Interview Questions

- **Theory:** What's the difference between hashing and encryption?
- **Theory:** What is a salt?
- **Theory:** Why bcrypt rather than SHA-256?
- **Practical:** How do you store passwords in your project?
- **Practical:** How do you make sure hashes never reach the client?

### 7. Project-Based Answers

**Hashing versus encryption?**
Encryption can be reversed with a key, and hashing can't. Passwords only ever need comparing, so hashing is right.

**What is a salt?**
Random data added before hashing, so identical passwords produce different hashes. bcrypt generates it and stores it in the hash, which is why `compare` needs no separate salt.

**Why not SHA-256?**
It's designed to be fast, which helps attackers. bcrypt is slow on purpose and its cost is adjustable.

**How do you store passwords?**
As bcrypt hashes with 10 rounds. Plain passwords exist only briefly in memory during a request.

**How do you keep hashes from the client?**
My queries list safe columns by name instead of using `SELECT *`, and login removes the hash before returning the user. My tests scan every API response for anything that looks like a hash, and found none.

### 8. Follow-up Questions

- **What's bcrypt's 72-byte limit?** It ignores anything past 72 bytes, so my validator rejects longer passwords.
- **Why the same login error for both cases?** Different messages would reveal which emails are registered.
- **What's missing from this login?** Rate limiting. It's something I'd add before production, to slow down password guessing.

---

## JWT Authentication

### 1. Concept Explanation

HTTP doesn't remember previous requests, so the server needs a way to know who's calling. A **JSON Web Token** is a signed string the server gives you at login, which you send with each request.

It has three parts: `header.payload.signature`. Anyone can read the header and payload, because they're only encoded, not encrypted. The **signature** is made with a secret only the server knows, so a changed token fails verification.

### 2. Project Implementation

- **`authService.ts`:** creates a token at sign-up and login.
- **`authenticate.ts`:** verifies it on each protected request.
- **`config/env.ts`:** requires a strong secret.

### 3. Code Reference

**File:** [backend/src/services/authService.ts](../../backend/src/services/authService.ts)

```ts
return jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: env.jwtExpiresIn, algorithm: 'HS256' })
```

- The token holds only the user's ID and timestamps, because anyone can read it.

**File:** [backend/src/middleware/authenticate.ts](../../backend/src/middleware/authenticate.ts)

```ts
const [scheme, token] = (req.headers.authorization ?? '').split(' ')
```

```ts
const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
```

```ts
const user = Number.isInteger(userId) ? await getUserById(userId) : null
```

```ts
req.user = user
```

- `verify` checks the signature and expiry, and throws if either is wrong.
- Allowing only HS256 stops an attacker from choosing a weaker algorithm.
- Loading the user on each request means a deleted user or changed role takes effect immediately.

### 4. Why We Used It

The server keeps no session list, so any server instance can verify a token, which helps with scaling. It also works well for separate frontend and API apps. The trade-off is that a token can't easily be revoked before it expires.

### 5. Real-Time Scenario

1. Sam logs in, and the server checks the password and returns a token.
2. The frontend stores it, and sends it as `Authorization: Bearer <token>` on each request.
3. `authenticate` verifies the signature and expiry, loads Sam, and sets `req.user`.
4. If someone edits the token's user ID, the signature no longer matches, and they get a 401.

### 6. Interview Questions

- **Theory:** What is a JWT, and what are its parts?
- **Theory:** Is a JWT encrypted? What must you avoid putting in it?
- **Theory:** JWT or sessions?
- **Practical:** How does JWT authentication work in your project?
- **Practical:** What happens if someone changes the token?
- **Practical:** How did you test it?

### 7. Project-Based Answers

**What is a JWT?**
A signed token with a header, a payload and a signature. The signature proves that the server issued it and that it hasn't been changed.

**Is it encrypted?**
No, the payload is only Base64 encoded, and anyone can read it. So mine holds only a user ID and timestamps, never passwords or personal data.

**JWT or sessions?**
Sessions store state on the server, and are easy to revoke. JWTs need no server storage, and scale easily, but are harder to revoke. I chose JWT since the frontend and API are separate apps, and it's what the project needed to demonstrate.

**How does it work in your project?**
Login verifies the password with bcrypt and returns a token signed with a secret from an environment variable. Protected routes run `authenticate`, which reads the `Authorization` header, verifies the token, loads the user and sets `req.user`. Anything invalid gets 401.

**What if someone changes the token?**
The signature no longer matches, so `verify` throws and they get 401. Without the secret, they can't create a valid signature.

**How did you test it?**
I tested a missing token, a garbage token, an expired token, a token signed with the wrong secret, the `none` algorithm, an edited payload, and a token for a user who doesn't exist. All got 401, and a correctly signed control token worked, which proves the test could tell the difference.

### 8. Follow-up Questions

- **How would you log someone out everywhere?** Keep a token version on the user and check it in `authenticate`. Since I already load the user per request, this would be a small change.
- **Where does the frontend store the token?** In `localStorage`, which is simple but readable by scripts if there's an XSS bug. `httpOnly` cookies avoid that, but need CSRF protection.
- **Why does the token last a day?** A balance between convenience and risk. Stricter apps use short-lived tokens with refresh tokens.
- **Why load the user on each request, since JWTs are meant to avoid that?** It costs a query, but role changes apply immediately, which matters more here than saving one lookup.

---

## Role-Based Authorization

### 1. Concept Explanation

- **Authentication** asks "who are you?"
- **Authorization** asks "what are you allowed to do?"

Role-based access control gives permissions by role. Some rules need more than a role, such as "customers can only see **their own** tickets". Checking that is called resource-level authorization.

### 2. Project Implementation

There are two levels:

- **Routes:** `authorize('admin')` for rules that depend only on role.
- **Services:** `requireVisibleTicket` and `checkUpdateAllowed` for rules that depend on the specific ticket.

### 3. Code Reference

**File:** [backend/src/routes/ticketRoutes.ts](../../backend/src/routes/ticketRoutes.ts)

```ts
ticketRoutes.delete('/:id', authorize('admin'), ticketController.deleteTicket)
```

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
if (!ticket || (user.role === 'customer' && ticket.customerId !== user.id)) {
  throw new AppError(404, 'We couldn\'t find that ticket.')
}
```

- A customer gets the same 404 for someone else's ticket as for a missing one, so they can't discover which ticket numbers exist.

```ts
if (changes.assignedAgentId !== undefined && changes.assignedAgentId !== user.id) {
```

- An agent may only assign a ticket to themselves.

**File:** [backend/src/services/commentService.ts](../../backend/src/services/commentService.ts)

```ts
await requireVisibleTicket(user, ticketId)
```

- Comments reuse the same check, so they can't become a way around it.

### 4. Why We Used It

Hiding buttons in the frontend isn't security, since anyone can call the API directly. This is where the rules are really enforced. The most common API vulnerability is changing an ID in a URL to reach someone else's data, and the ownership check is what stops that.

### 5. Real-Time Scenario

Liam calls `GET /api/tickets/1006/comments` with his valid token. That's Priya's ticket. `authenticate` passes, since Liam is a real user, but `requireVisibleTicket` sees he doesn't own it and returns 404. A test confirmed that he can neither read nor add comments there.

### 6. Interview Questions

- **Theory:** What's the difference between authentication and authorization?
- **Theory:** What is an IDOR vulnerability?
- **Practical:** How did you implement role-based access?
- **Practical:** Why not rely on the frontend for this?
- **Practical:** Where do you check that a customer owns a ticket?

### 7. Project-Based Answers

**Authentication versus authorization?**
Authentication identifies the user, and authorization decides what they can do. In my API, `authenticate` handles the first, and gives 401. `authorize` and the service rules handle the second, and give 403.

**What is IDOR?**
Insecure Direct Object Reference: changing an ID to reach data that isn't yours. I prevent it by checking ownership in `requireVisibleTicket`, rather than trusting the ID.

**How did you implement it?**
At two levels. `authorize` middleware covers role-only rules, like admin-only delete. Services cover rules that depend on the ticket, like a customer editing only their own ticket while it's open.

**Why not rely on the frontend?**
Frontend code runs on the user's machine and can be changed, and the API can be called directly. So the frontend's role checks are only for the screen, and the server decides.

**Where do you check ownership?**
In `requireVisibleTicket`, which reads, updates, deletes and comments all go through. Keeping it in one place means it can't be missed.

### 8. Follow-up Questions

- **Why does the comment author come from the token, not the request?** Otherwise anyone could post as anyone. My validator drops a sent `userId`, and a test confirmed this.
- **How would you add a new role?** Add it to the union type, then to the `authorize` calls and service rules. TypeScript helps find the places.
- **Should rules live in the database?** Filtering there is efficient, and my ticket list does that with a `WHERE` clause on the customer, though the app still decides what's allowed.
