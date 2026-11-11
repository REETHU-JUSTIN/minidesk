// Creates an admin or agent account. Public sign-up can only create customers,
// so this is how the first admin is made on a new deployment.
//
// Usage:
//   NEW_USER_PASSWORD=... npm run user:create -- --name "Alex Morgan" --email admin@yourcompany.com --role admin
//
// The password comes from an environment variable rather than the command, so it isn't
// saved in your shell history along with the other options.
import { parseArgs } from 'node:util'
import bcrypt from 'bcrypt'
import { connectDatabase, disconnectDatabase } from '../config/db.js'
import { User } from '../models/User.js'
import { validateRegister } from '../utils/validators.js'

const roles = ['admin', 'agent', 'customer']

async function main() {
  const { values } = parseArgs({
    options: { name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' } },
  })

  const role = values.role
  if (!roles.includes(role)) throw new Error('Use --role admin, --role agent or --role customer.')

  // The same checks as public sign-up, so every account meets the same rules.
  const result = validateRegister({ name: values.name, email: values.email, password: process.env.NEW_USER_PASSWORD })
  if (!result.ok) {
    if (result.errors.password) result.errors.password += ' Set it in the NEW_USER_PASSWORD environment variable.'
    throw new Error(Object.values(result.errors).join(' '))
  }

  const { name, email, password } = result.data
  const passwordHash = await bcrypt.hash(password, 10)

  await connectDatabase()
  await User.init() // the unique email index must exist before checking for duplicates
  try {
    await User.create({ name, email, passwordHash, role })
  } catch (error) {
    if ((error).code === 11000) throw new Error('An account with this email already exists.')
    throw error
  }
  console.log(`Created ${role} account for ${email}.`)
}

main()
  .catch((error) => {
    console.error('Could not create the user:', error.message)
    process.exitCode = 1
  })
  .finally(() => disconnectDatabase())
