#!/usr/bin/env node

import { Command } from "commander";

const program = new Command()
const baseUrl = 'http://localhost:7336'

program.name('peeked')
    .description('Connect visual agents with your browser.')
    .version('0.0.1');

program.argument('[url]', 'The page URL to capture screenshot of.')
    .option('-l, --list', 'List all tracked URLs.')
    .action(async (url, options) => {
        if (options.list) {
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
        } else if (url) {
            try {

                const response = await fetch(`${baseUrl}/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: url }),
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
        } else {
            program.help()
        }
    })

program.parse(process.argv)

// ADD START COMMAND!