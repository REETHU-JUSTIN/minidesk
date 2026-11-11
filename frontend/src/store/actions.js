import { createAction } from '@reduxjs/toolkit'

// Every slice listens for this and clears its data,
// so the next person to sign in can never see the previous person's tickets.
export const userLoggedOut = createAction('auth/userLoggedOut')
