#!/usr/bin/env node

const NewmanConfig = require('../lib/core')
version = require('../package.json').version
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('../lib/files');
const inquirer  = require('../lib/inquirer');
const yargs = require("yargs");
const { option } = require('yargs');
var feedFilePath = ""

clear()
console.log(
    chalk.rgb(220, 120, 60)(
        figlet.textSync('Newman-Run', {
            font: 'Doom',
            horizontalLayout: 'full',
            whitespaceBreak: true
        })
    )
);

const file_error_message = chalk.red.bold('Need either feed file (-f) or collections (-c) file to run the tests or at least (-r) to remove the files from the reports directory!\n')

const options = yargs
        .usage("Usage: newman-run -f <feed_file_path>")
        .option("f", { alias: "feed", describe: "Feed file path", type: "string"})
        .option("d", { alias: "folder", describe: "Folder name", type: "string"})
        .option("c", { alias: "collection", describe: "Collection file path file path", type: "string"})
        .option("t", { alias: "iterationData", describe: "Iteration data", type: "string"})
        .option("i", { alias: "iterationCount", describe: "Iteration count", type: "number"})
        .option("o", { alias: "insecure", describe: "Disables SSL verification checks and allows self-signed SSL certificates", type: "boolean"})
        .option("e", { alias: "environment", describe: "Environment file path file path", type: "string"})
        .option("r", { alias: "remove", describe: "To remove the files from reporting directory"})
        .check(argv => {
            if(typeof argv.f === 'undefined' && typeof argv.c === 'undefined' && typeof argv.r === 'undefined') {
                console.log(file_error_message)
                return false
            } else {
                return true
            }
        }).argv

const NC = new NewmanConfig()

if (options.remove) {
    NC.clearResultsFolder()
}
if (typeof options.feed !== 'undefined' &&
        typeof options.collection === 'undefined' &&
        typeof options.environment === 'undefined') {
    NC.looprun(options.feed)
} else if (typeof options.collection !== 'undefined' &&
        typeof options.feed === 'undefined') {
    NC.runGeneric(options)
} else if (typeof options.collection !== 'undefined' &&
        typeof options.environment !== 'undefined' &&
        typeof options.feed === 'undefined') {
    NC.runGeneric(options)
} else if (typeof options.feed !== 'undefined' &&
        typeof options.collection !== 'undefined' &&
        typeof options.environment != undefined) {
    NC.looprun(options.feed)
    NC.runGeneric(options)
} else if (typeof options.feed !== 'undefined' &&
        typeof options.collection !== 'undefined' &&
        typeof options.environment === 'undefined') {
    NC.looprun(options.feed)
    NC.runGeneric(options)
}
