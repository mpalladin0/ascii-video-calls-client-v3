import { useContext, useEffect, useLayoutEffect, useMemo } from "react";
import { useState } from "react";
import { CallContext, Participant, } from "./Participant";
import _ from 'lodash'
import { Container, Grid } from "@nextui-org/react";


export const Layout = () => {
    const { socket, startCapture } = useContext(CallContext)
    const [users, setUsers] = useState<any[]>([])

    useLayoutEffect(() => { startCapture(60) }, [])

    useLayoutEffect(() => {
        socket.on("user joined", (allSockets: any[]) => {
            const filtered = _.remove(allSockets, (n) => {
                // console.log(n);
                return n != socket.id;
            });

            console.log(filtered)
            setUsers(filtered)
        })

        return () => {  socket.emit("join call") }
    }, [])


    return (
        <Grid.Container gap={2} justify="center">
            <Grid>
                <Participant isPrimary={true} socketId={socket.id} key={socket.id} />
            </Grid>
            {users.map((id) => <Grid><Participant isPrimary={false} socketId={id} key={id.toString()} /></Grid>)}
        </Grid.Container>
    )
}
