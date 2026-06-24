#!/usr/bin/env node

import { Command } from "commander";

const program = new Command()
const baseUrl = 'http://localhost:7336'

program.name('peeked')
    .description('Connect visual agents with your browser.')
    .version('0.1.0');

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
            console.log('Server not started. Did you run: peeked begin?')
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

program.parse(process.argv)

// ADD START COMMAND!