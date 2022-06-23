import { useContext, useEffect, useLayoutEffect, useMemo } from "react";
import { useRef } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { CallContext, Participant, } from "./Participant";
import { useCanvas } from "./useCanvas";
import _ from 'lodash'
import { Container, Grid } from "@nextui-org/react";


export const Layout = () => {
    const { socket, startCapture } = useContext(CallContext)
    // const [socketId, setSocketId] = useState('')

    // const [socketReady, setSocketReady] = useState(false)

    useEffect(() => { startCapture(60) }, [])

    useEffect(() => {
        // socket.on("connect", () => { 
        //     setSocketId(socket.id)
        //     setSocketReady(true)
        // })

        // if (socket.connected) {
        //     setSocketId(socket.id)
        //     setSocketReady(true)
        // }

        socket.on("user joined", (allSockets: any[]) => {
            const filtered = _.remove(allSockets, (n) => {
                // console.log(n);
                return n == socket.id;
            });

            setUsers(filtered)
        })

    }, [])

    const [users, setUsers] = useState([])

    // const [capturingRef, setCapturingRef] = useState(false)
    // const capturing = useCallback((state: boolean) => {
    //     setCapturingRef(state)
    // }, [])

    // socket.on("user joined", (allSockets: any) => {
    //     console.log(allSockets)
    //     setUsers(allSockets)
    // })

    // if (!socketReady) return <p>Loading...</p>

    // const ListUsers = users.map((id) => (
    //     <Participant 
    //         isPrimary={false}
    //         socketId={id}
    //         // socket={socket} 
    //         // secondarySocketId={id} 
    //         key={id} 
    //         // isCapturing={capturingRef}
    //     />
    // ))

    // const { converterRef } = useContext(CallContext)

    return (
        <Grid.Container gap={2} justify="center">
            <Grid>
                <Participant isPrimary={true} socketId={socket.id} key={socket.id} />
            </Grid>
            {users.map((id) => <Grid><Participant isPrimary={false} socketId={id} key={id.toString()} /></Grid>)}
        </Grid.Container>
    )
}
