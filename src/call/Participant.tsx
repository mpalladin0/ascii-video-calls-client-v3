import { Card, Container, Row, useTheme, Text, Button, Col, theme } from '@nextui-org/react'
import React, { createContext, createRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Socket } from "socket.io-client"
import { AsciiConverter } from './AsciiConverter'
import { useCanvas } from './useCanvas' 


export const Participant = ({ socketId, isPrimary }: { socketId: string, isPrimary: boolean }) => {
    if (isPrimary) return (
        <Card variant="bordered" css={{ width: "fit-content", backgroundColor: "$black" }}>
            <Card.Header css={{ position: "absolute", zIndex: 1 }}>
                <Col>
                <Text h3 weight="bold" color="#ffffffAA">
                    You
                </Text>
                </Col>
            </Card.Header>
            <Card.Body css={{ p: 0, m: 0 }}>
                <pre 
                    style={{ 
                        fontSize: "3px",
                        // width: "100%",
                        // height: "100%",
                        color: "white",
                        margin: 0,
                        padding: 0,
                        backgroundColor: "transparent"
                    }} 
                    id={`primary-frame-${socketId}`} />
            </Card.Body>
        </Card>
    )

   return (
        <Card variant="bordered" css={{ width: "fit-content", backgroundColor: "$black" }}>
            <Card.Header css={{ position: "absolute", zIndex: 1 }}>
                <Col>
                <Text h3 weight="bold" color="#ffffffAA">
                    {socketId}
                </Text>
                </Col>
            </Card.Header>
            <Card.Body css={{ p: 0, m: 0 }}>
                <pre 
                    style={{ 
                        fontSize: "3px",
                        color: `${theme.colors.green700}`,
                        margin: 0,
                        padding: 0,
                        backgroundColor: "transparent"
                    }}
                    id={`secondary-frame-${socketId}`}
                />
            </Card.Body>
        </Card>
    )
}

interface Call {
    ready: boolean
    socket: Socket
    setReady: React.Dispatch<React.SetStateAction<boolean>>
    join: () => void
    allSockets: any[]
    startCapture: (fps: number) => Promise<void>
    converterRef: React.MutableRefObject<AsciiConverter>
}

export const CallContext = createContext({} as Call)

export const CallProvider = ({ children, socket }: { children: React.ReactNode, socket: Socket }) => {
    const [ready, setReady] = useState(false)

    const video = useRef<HTMLVideoElement>()
    const canvas = useRef<HTMLCanvasElement>()
    const converterRef = useRef<AsciiConverter>() as React.MutableRefObject<AsciiConverter>

    const primaryParticipantContainer = useRef<HTMLPreElement>()

    useLayoutEffect(() => { primaryParticipantContainer.current = document.getElementById(`frame-${socket.id}`) as HTMLPreElement}, [])
    useLayoutEffect(() => { video.current = document.createElement("video") }, [])
    useLayoutEffect(() => { canvas.current = useCanvas(240, 160) }, [])


    const setupConverter = () => new AsciiConverter(canvas.current!)

    const startCapture = async (fps: number) => {
        converterRef.current = setupConverter()

        await video.current!.play()

        setInterval(() => {
            try {
                converterRef.current?.context?.drawImage(video.current as CanvasImageSource, 0, 0, canvas.current!.width, canvas.current!.height)
                // converterRef.current?.context.drawImage(video.current, 0, 0, canvas.current.width, canvas.current.height)
                canvasToAscii()
            } catch (err) {
                throw err
            }
        }, Math.round(1000 / fps))
    }
    
    const pauseCapture = () => {}

    
    const canvasToAscii = () => {
        /** Skips the server and updates the frame directly */
        primaryParticipantContainer.current = document.getElementById(`primary-frame-${socket.id}`) as HTMLPreElement
        const asciiFrame = converterRef.current!.fromCanvas()
        primaryParticipantContainer.current.innerText = asciiFrame

        /** Inform the other participants about this user's new frame */
        socket.volatile.emit("frame update from client", asciiFrame);

    }

    async function join() {
        console.log("Starting join sequence..")

        console.log("Requesting permission for camera..")
        const mediaStream = await window.navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true
            })   
            .catch(err => { throw err })         


     console.log("Setting up video object..")
        video.current!.srcObject = mediaStream
        video.current!.playsInline = true

        console.log("Informing server about new user")
        socket.emit("join call")

        console.log("Updating ready state")
        setReady(true)
    }

    const [allSockets, setAllSockets] = useState([])

    socket.on("user joined", (allSockets: any) => {
        console.log(allSockets)
        setAllSockets(allSockets)
    })

    let pre: HTMLPreElement;
    socket.on("frame update from server", (socketId: string, frame: string) => {
        pre = document.getElementById(`secondary-frame-${socketId}`) as HTMLPreElement
        if (pre === null) return
        pre.innerText = frame
    })


    return (
        <CallContext.Provider value={{ ready, setReady, join, socket, allSockets, startCapture, converterRef }}>
            {children}
        </CallContext.Provider>
    )

}