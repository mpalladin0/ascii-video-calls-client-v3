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

    if (!isPrimary) return (
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
                        color: `${theme.colors.green600}`,
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




// export const PrimaryParticipant = ({ primarySocketId  }: { primarySocketId: string }) => {
//     const { theme } = useTheme()

//     const { converterRef  } = useContext(CallContext)

//     return (
//             <Card css={{
//                     // height: converterRef.current.canvas.height*4,
//                     backgroundColor: "$black",
//                     width: "fit-content"
//                 }}>
//                 <Card.Body css={{ p: 0, m: 0,  }}>
//                         <pre style={{ 
//                             fontSize: "3px",
//                             // width: "100%",
//                             // height: "100%",
//                             color: "green",
//                             margin: 0,
//                             padding: 0,
//                             backgroundColor: "transparent"
//                             }} id={`primary-frame-`+primarySocketId} />
//                     </Card.Body>
//                     <Card.Footer css={{ justifyItems: "flex-start", m: 0}}>
//                     <Row wrap="wrap" justify="space-between" align="center">
//                         <Text h3 css={{
//                             color: "$backgroundContrast"
//                         }} >You</Text>
//                     </Row>
//                 </Card.Footer>
//             </Card>
//     )
// }

// export const SecondaryParticipant = ({ secondarySocketId }: { secondarySocketId: string }) => {
//     const { socket } = useContext(CallContext)

//     const asciiFrameRef = useRef('')

//     let elFrame
//     socket.on("frame update from server", (socketId: string, frame: string) => {
//         if (socket.id === socketId) return 
//         asciiFrameRef.current = frame
//         elFrame = document.getElementById(`secondary-frame-${socketId}`)
//         elFrame.innerText = asciiFrameRef.current
//     })

//     return (
//         <>
//             <p>Secondary Participant {secondarySocketId}: </p>
//                 <pre style={{ fontSize: "5px" }} id={`secondary-frame-`+secondarySocketId} />
//             <hr />
//         </>
//     )
// }


// export const Participant = ({ socket, socketId }:  { socket: Socket, socketId: string, isCapturing: boolean }) => {
//     const asciiFrameRef = useRef('')

//     let elFrame
//     socket.on("frame update from server", (socketId: string, frame: string) => {
//         if (socket.id === socketId) return 
//         asciiFrameRef.current = frame
//         elFrame = document.getElementById(`secondary-frame-${socketId}`)
//         elFrame.innerText = asciiFrameRef.current
//     })


//     /**
//      * Only display this for the computer owner
//      */
//     // if (socket.id === socketId) return <PrimaryParticipant primarySocketId={socketId} />
//     return <SecondaryParticipant secondarySocketId={socketId} />

//     // /**
//     //  * Display this for everyone else
//     //  */
//     // return (
//     //     <>
//     //         <p>Other Participant: {socketId}</p>
//     //         <pre style={{
//     //             fontSize: "5px"
//     //         }} id={`frame-`+socketId}></pre>
//     //         <hr />
//     //         {/* <p id={`socket-`+socketId}></p> */}
//     //     </>
//     // )
// }


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

    const video = useRef<HTMLVideoElement>(null)
    const canvas = useRef<HTMLCanvasElement>(null)
    const converterRef = useRef<AsciiConverter>()

    const primaryParticipantContainer = useRef<HTMLPreElement>(null)

    useEffect(() => { 
        primaryParticipantContainer.current = document.getElementById(`frame-${socket.id}`) as HTMLPreElement
    }, [])
    useEffect(() => { video.current = document.createElement("video") }, [])
    useEffect(() => { canvas.current = useCanvas(240, 160) }, [])

    const requestDisplayMedia = async () => {
        console.log("[Client] Requesting display MediaStream...")
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true
            })

            return mediaStream

        } catch(err) { throw err }
        // } finally {
        //     // video.current.play()
        //     // setupCanvas()
        // }   

    }

    const setupConverter = () => new AsciiConverter(canvas.current)

    const startCapture = async (fps: number) => {
        converterRef.current = setupConverter()

        await video.current.play()

        setInterval(() => {
            try {
                converterRef.current.context.drawImage(video.current, 0, 0, canvas.current.width, canvas.current.height)
                canvasToAscii()
            } catch (err) {
                console.log(err)
            }
        }, Math.round(1000 / fps))
    }
    
    const pauseCapture = () => {}

    
    const canvasToAscii = () => {
        /** Skips the server and updates the frame directly */
        if (primaryParticipantContainer.current === null) primaryParticipantContainer.current = document.getElementById(`primary-frame-${socket.id}`) as HTMLPreElement
        else {
            const asciiFrame = converterRef.current.fromCanvas()
            primaryParticipantContainer.current.innerText = asciiFrame
            socket.emit("frame update from client", asciiFrame);
        }

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
        video.current.srcObject = mediaStream
        video.current.playsInline = true

        console.log("Informing server about new user")
        socket.emit("join call")

        console.log("Updating ready state")
        setReady(true)
        // startCapture(60)
        // } finally {
        //     // video.current.play()
        //     // setupCanvas()
        // }   

        // try {
            // const mediaStream = await requestDisplayMedia()
            // if (mediaStream) { 
            //     video.current.srcObject = mediaStream 
            //     video.current.playsInline = true

            //     setReady(true)
            //     await video.current.play()
            //     startCapture(60)
            //         // .then(() => {
            //         //     startCapture(60)
            //         //     setReady(true)

            //         //     socket.emit("join call")
            //         // })
            //         // .catch(err => console.log(err))
            // }
            // if (mediaStream) {
            //     const captureReady = await startCapture(60)
            //     if (captureReady) setReady(true)

            //     socket.emit("join call")
            //     setReady(true)
            // }
        // } catch (err) { throw err }
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

        // if (pre.current !== null) {
        //     pre.current.innerText = frame
        // }
    })


    return (
        <CallContext.Provider value={{ ready, setReady, join, socket, allSockets, startCapture, converterRef }}>
            {children}
        </CallContext.Provider>
    )

}