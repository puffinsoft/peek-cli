import express, { type Request, type Response } from "express";
import { WebSocketServer } from "ws";
import fs from "fs";

const { pidPath } = process.env
const cleanup = () => { if (pidPath && fs.existsSync(pidPath)) fs.unlinkSync(pidPath) }
process.on('SIGTERM', () => { cleanup(); process.exit(0) })
process.on('SIGINT', () => { cleanup(); process.exit(0) })
process.on('exit', cleanup)

/**
 * inbound messages from WebSocket
 */
interface SocketMessage {
    success: boolean,
    message: string | null,
    id: string, // every message must be associated w/ request for multi-agent
    data: string | null // usually base64
}

/**
 * identifies request to fulfill w/ ID
 */
const requestMap: Map<string, Response> = new Map()

const wss = new WebSocketServer({ port: 7335 });
console.log('WebSocket server started.')

const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();

        ws.send(JSON.stringify({
            id: "heartbeat",
            type: "heartbeat"
        }))
    })
}, 15 * 1000)

wss.on('close', () => {
    clearInterval(heartbeatInterval)
})

wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('message', (raw) => {
        const message: SocketMessage = JSON.parse(raw.toString())

        if(message.id === "heartbeat"){
            ws.isAlive = true;
            return;
        }

        const req = requestMap.get(message.id);

        if (req) {
            req.json({
                success: message.success,
                message: message.message,
                data: message.data
            })
            requestMap.delete(message.id)
        }
    })
})

// ======== EXPRESS ========

/**
 * express server response
 */
interface ServerResponse {
    success: boolean;
    message: string | null;
    data: string | null;
}

interface OutboundSocketMessage {
    id: string;
    type: "screenshot" | "urls" | "heartbeat",
    url?: string;
}

const app = express()
app.use(express.json())

app.get('/status', (req: Request, res: Response) => {
    if (wss.clients.size === 0) {
        return res.json({
            success: true,
            data: false
        })
    }

    return res.json({
        success: true,
        data: true
    })
})

app.get('/urls', (req: Request, res: Response) => {
    if (wss.clients.size === 0) {
        return res.json({
            success: false,
            message: "Chrome extension not connected.",
            data: null
        })
    }

    const ws = Array.from(wss.clients)[0];
    const id = crypto.randomUUID()

    requestMap.set(id, res);
    ws.send(JSON.stringify({
        id,
        type: "urls"
    }))

    setTimeout(() => {
        if (requestMap.has(id)) {
            res.json({
                success: false,
                message: "Chrome extension timed out.",
                data: null
            })
            requestMap.delete(id)
        }
    }, 10000)
})

app.post('/send', (req: Request, res: Response) => {
    if (wss.clients.size === 0) {
        return res.json({
            success: false,
            message: "Chrome extension not connected.",
            data: null
        })
    }

    const ws = Array.from(wss.clients)[0];
    const id = crypto.randomUUID()

    const { url } = req.body;

    requestMap.set(id, res);
    ws.send(JSON.stringify({
        id,
        type: "screenshot",
        url
    }))

    setTimeout(() => {
        if (requestMap.has(id)) {
            res.json({
                success: false,
                message: "Chrome extension timed out. Try focusing on Chrome and trying again.",
                data: null
            })
            requestMap.delete(id)
        }
    }, 10000)
});

app.listen(7336, () => {
    console.log("CLI server started.")
})
