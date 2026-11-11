import { createContext } from 'react'

// Components read this through the useAuth hook. It's in its own file because
// React's fast refresh works best when a component file only exports components.
export const AuthContext = createContext(null)
