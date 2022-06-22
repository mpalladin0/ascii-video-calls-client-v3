import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import { App } from "./App";
import { CallProvider } from "./call/Participant";
import { useSocket } from "./call/useSocket";

const socket = useSocket("https://ascii-server.michaelpalladino.io")
const container = document.getElementById("app")
const root = createRoot(container)
root.render(<CallProvider socket={socket}><App tab="home" /></CallProvider>)