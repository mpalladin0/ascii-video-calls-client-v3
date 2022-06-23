import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { createTheme, NextUIProvider } from '@nextui-org/react'
import { io } from 'socket.io-client'
import { Layout } from './call/Layout'
import { CallContext, CallProvider } from './call/Participant'
import { NotReady } from './prejoin/NotReady'

const darkTheme = createTheme({
type: 'dark',
})

export function App() { 
    const { ready } = useContext(CallContext)
    return (
            <>
            {ready ? <NextUIProvider theme={darkTheme}><Layout /></NextUIProvider> : <NextUIProvider><NotReady /></NextUIProvider>}
            </>
    )
} 
