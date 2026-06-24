#!/usr/bin/env node


import { Command } from "commander";
declare const __VERSION__: string;

const program = new Command()
const baseUrl = 'http://localhost:7336'

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
                console.log(data)
            } else {
                console.error('Failed. ' + message);
            }
        } catch (error) {
            console.log('Server not started. Did you run: peeked begin?')
        }
    })


// ==== server.ts logic ====

import os from 'os';
import fs from 'fs';
import path, { dirname } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const serverPath = path.join(__dirname, 'server.js')
const pidPath = path.join(os.tmpdir(), '.peek_cli.pid')
const logPath = path.join(os.tmpdir(), '.peek_cli.log')

program.command('start')
    .description('Start WebSocket server for extension link.')
    .action(() => {
        if (fs.existsSync(pidPath)) {
            console.error('WebSocket server already started.');
            return;
        }

        const out = fs.openSync(logPath, 'a');
        const err = fs.openSync(logPath, 'a');

        const child = spawn('node', [serverPath], {
            detached: true,
            stdio: ['ignore', out, err],
        });

        if (child.pid) {
            fs.writeFileSync(pidPath, child.pid.toString(), 'utf-8')
        }
        child.unref()

        console.log('Successfully started server.')
    })

program.command('stop')
    .description('Stops WebSocket server.')
    .action(() => {
        if(!fs.existsSync(pidPath)){
            console.error('Nothing to stop.')
            return;
        }

        const pid = +fs.readFileSync(pidPath, 'utf-8')
        try{
            process.kill(pid, 'SIGTERM')
            console.log('Successfully stopped server.')
        } catch (error: any){
            if(error.code === "ESRCH"){
                console.error("Failed to find server process. It may have crashed or been killed already.");
            } else{
                console.log("Failed to find server process.")
            }
        }

        fs.unlinkSync(pidPath)
    })


await program.parseAsync(process.argv)
