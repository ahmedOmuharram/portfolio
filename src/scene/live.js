import { createContext, useContext } from 'react'

export const LiveContext = createContext(null)

export const useLive = () => useContext(LiveContext)
