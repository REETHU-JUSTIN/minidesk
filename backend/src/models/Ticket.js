import { Schema, model } from 'mongoose'

// Comments are embedded inside their ticket, because they belong to it and are read with it.
// Deleting a ticket removes its comments automatically, in a single operation.
const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, minlength: 1, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
})

// Customers and agents are referenced by ID rather than copied, because they're shared
// between many tickets. A changed name then only needs updating in one place.
const ticketSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 5, maxlength: 120 },
    description: { type: String, required: true, minlength: 10, maxlength: 5000 },
    category: { type: String, enum: ['general', 'billing', 'technical', 'account'], required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAgent: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    comments: { type: [commentSchema], default: [] },
  },
  // Mongoose fills in createdAt, and updates updatedAt on every change.
  { timestamps: true },
)

// Indexes speed up the searches this app runs most often.
// The cost is a little extra storage and slightly slower writes.
ticketSchema.index({ status: 1 })
ticketSchema.index({ priority: 1 })
ticketSchema.index({ customer: 1 })
ticketSchema.index({ assignedAgent: 1 })
ticketSchema.index({ createdAt: -1 })
ticketSchema.index({ updatedAt: -1 })

export const Ticket = model('Ticket', ticketSchema)
