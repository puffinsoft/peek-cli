#!/usr/bin/env node


import { Command } from "commander";
import fs from 'fs';

declare const __VERSION__: string;

const program = new Command()
const baseUrl = 'http://localhost:7336'

const tmpDir = path.join(os.tmpdir(), 'peek_cli')
fs.mkdirSync(tmpDir, { recursive: true })

const tmpImages = path.join(tmpDir, 'images')
fs.mkdirSync(tmpImages, { recursive: true })

program.name('peeked')
    .description('Connect visual agents with your browser.')
    .version(__VERSION__);

program.command('list')
    .description('List all tracked URLs.')
    .action(async () => {
        try {
            const response = await fetch(`${baseUrl}/urls`)
            const { success, message, data } = await response.json()
            if (success) {
                console.log(data)
            } else {
                console.error('Failed. ' + message);
            }
        } catch (error) {
            console.log('Server not started. Did you run: peeked start?')
        }
    })

program.command('at <url>')
    .description('Capture a screenshot of the given URL.')
    .action(async (url) => {
        try {
            const response = await fetch(`${baseUrl}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            })

            const { success, message, data } = await response.json()
            if (success) {
                const fileName = crypto.randomUUID().split('-')[0] + '.jpg'
                const base64 = data.split(';base64,').pop()
                const buffer = Buffer.from(base64, 'base64')
                const imagePath = path.join(tmpImages, fileName);
                fs.writeFileSync(imagePath, buffer);
                console.log("Image saved to: " + imagePath.toString());
            } else {
                console.error('Failed. ' + message);
            }
        } catch (error) {
            console.log('Server not started. Did you run: peeked begin?')
        }
    })


// ==== server.ts logic ====

import os from 'os';
import path, { dirname } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const serverPath = path.join(__dirname, 'server.js')
const pidPath = path.join(tmpDir, '.server.pid')
const logPath = path.join(tmpDir, '.server.log')

program.command('start')
    .description('Start WebSocket server for extension link.')
    .action(async () => {
        try {
            const response = await fetch(`${baseUrl}/status`)

            const { success, data } = await response.json()
            console.error('WebSocket server already started. Run peeked stop first.');
        } catch (error) {
            // start new process

            if (fs.existsSync(pidPath)) {
                fs.unlinkSync(pidPath);
            }

            const out = fs.openSync(logPath, 'a');
            const err = fs.openSync(logPath, 'a');

            const child = spawn('node', [serverPath], {
                detached: true,
                stdio: ['ignore', out, err],
                env: { ...process.env, pidPath },
            });

            if (child.pid) {
                fs.writeFileSync(pidPath, child.pid.toString(), 'utf-8')
            }
            child.unref()

            console.log('Successfully started server.')

            const previousImages = fs.readdirSync(tmpImages, { withFileTypes: true })
            for (const image of previousImages) {
                if (image.isFile()) fs.unlinkSync(path.join(tmpImages, image.name))
            }
        }
    })

program.command('status')
    .description('Get server & connection status')
    .action(async () => {
        try {
            const response = await fetch(`${baseUrl}/status`)

            const { success, data } = await response.json()
            if (data === true) {
                console.log("You're good to go - Server started. Extension connected.")
            } else {
                console.log("Server started. Extension not connected.")
            }
        } catch (error) {
            console.log('Server not started. Extension not connected.')
        }
    })

program.command('stop')
    .description('Stops WebSocket server.')
    .action(() => {
        if (!fs.existsSync(pidPath)) {
            console.error('Nothing to stop.')
            return;
        }

        const pid = +fs.readFileSync(pidPath, 'utf-8')
        try {
            process.kill(pid, 'SIGTERM')
            console.log('Successfully stopped server.')
        } catch (error: any) {
            if (error.code === "ESRCH") {
                console.error("Failed to find server process. It may have crashed or been killed already.");
            } else {
                console.log("Failed to find server process.")
            }
        }

        fs.unlinkSync(pidPath)
    })


await program.parseAsync(process.argv)
