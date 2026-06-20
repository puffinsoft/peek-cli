import express, { type Request, type Response } from "express";
import { WebSocketServer } from "ws";

interface SocketMessage {
    type: "screenshot",
    id: string, // every message must be associated w/ request for multi-agent
    data: string // usually base64
}

interface ServerResponse {
    success: boolean;
    message: string | null;
    data: string | null;
}

/**
 * identifies request to fulfill w/ ID
 */
const requestMap: Map<string, Response> = new Map()

const wss = new WebSocketServer({ port: 7335 });

const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
        if(ws.isAlive === false) {
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
        console.log('ping')
    })
}, 20 * 1000)

wss.on('close', () => {
    clearInterval(heartbeatInterval)
})

wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
        console.log('pong')

        ws.isAlive = true;
    })

    ws.on('message', (raw) => {
        const message: SocketMessage = JSON.parse(raw.toString())
        console.log('message', message)
        const req = requestMap.get(message.id);
        if(req){
            req.json({
                success: true,
                message: null,
                data: message.data
            })
        }
    })
})

const app = express()
app.use(express.json())

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
        url
    }))

});

app.listen(7336, () => {
    console.log("started express server")
})
