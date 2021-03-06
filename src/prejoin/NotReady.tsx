import { Container, Card, Row, Text, Col, Spacer, Input, Button, Grid, Link } from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { CallContext } from "../call/Participant";


const JoinHeader = ({ text }) => {
    return (
        <Text h2 color="black" css={{ m: 0, textAlign: 'center' }}>
            {text}
        </Text>
    )
}

const NicknameInput = ({ placeholder }) => {
    return <Input label="Nickname" placeholder={placeholder} />
}

const JoinButton = () => {
    const { socket, join } = useContext(CallContext)
    const [socketReady, setSocketReady] = useState(socket.connected)

    useEffect(() => {
        socket.on("connect", () => setSocketReady(socket.connected))
    }, [])

    if (!socketReady) return <Button onPress={() => {}} disabled>Connecting..</Button>
    return <Button onPress={() => join()}>Join</Button>
}


export const NotReady = () => {
    const { socket } = useContext(CallContext)
    const [socketId, setSocketId] = useState('')

    useEffect(() => {
        socket.on("connect", () => { 
            setSocketId(socket.id)
        })
    }, [])

    const JoinCard = ({ text }) => {
        return (
            <Card
                variant="bordered"
            >
            <Card.Body>
                <JoinHeader text={text} />
                <Spacer y={2} />
                <NicknameInput placeholder={socketId} />
                <Spacer y={1} />
                <JoinButton />
            </Card.Body>
            </Card>
        );
    };
  return (
    <>
      <Grid.Container gap={2} justify="center">
        <Grid xs>
        </Grid>
        <Grid xs>
        </Grid>
        <Grid xs>
        </Grid>
      </Grid.Container>
      <Grid.Container gap={2} justify="center">
        <Grid xs>
        </Grid>
        <Grid xs={5}>
            <JoinCard text="Join the ASCII Call" />
        </Grid>
        <Grid xs>
        </Grid>
      </Grid.Container>
      <Grid.Container gap={2}>
        <Grid xs>
        </Grid>
        <Grid xs={5} justify="center">
            <div>
            <Text b>Interested in how this works? <Link icon href="https://michaelpalladino.io/projects/ascii-video-feed">Read about it here</Link></Text>
            </div> 
        </Grid>
        <Grid xs>
        </Grid>
      </Grid.Container>
    </>
  );
}

