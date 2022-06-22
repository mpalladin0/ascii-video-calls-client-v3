import { NextUIProvider } from '@nextui-org/react'
import { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { Layout } from './call/Layout'
import { CallContext, CallProvider } from './call/Participant'
import { NotReady } from './prejoin/NotReady'

export function App() {
    const { ready, socket } = useContext(CallContext)

    return (
        <NextUIProvider>
            {ready ? <Layout /> : <NotReady />}
        </NextUIProvider>
    )

  } 
