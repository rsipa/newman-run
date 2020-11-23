const newman = require('newman');
const files = require('../lib/files');
const fs = require('fs')
const path = require('path');
const rimraf = require('rimraf');

class NewmanConfig{

    constructor(){
        this.current_path = path.dirname(fs.realpathSync(__filename))
        this.reporters_list = ['cli', 'json', 'html', 'allure']
        this.allure_report_path = './reports/allure'
        this.newman_json_report_path = './reports/json/'
        this.newman_html_report_path = './reports/html/'
    }

    looprun(root_json_file){
        console.log('Feed file taken is: ' + root_json_file);
        var root_json = this.get_relative_path(root_json_file)
        var root_file = require(root_json)
        // var root_file = fs.readFileSync(root_json);
        var run_list = root_file.runs
        console.log("!----------------------------------Files Taken to run---------------------------------------!")
        run_list.map(value => {
            console.log(value)
            this.runGeneric(value)
        })
        console.log("!-------------------------------------------------------------------------------------------!")
    }

    get_relative_path(abs_path) {
        console.log('CurrentDirectoryBase : ' + files.getCurrentDirectoryBase() + ' - this.current_path ' + this.current_path)
        return files.getCurrentDirectoryBase() + abs_path
        /*
        if (abs_path.startsWith('.')) {
            console.log('relativePath startsWithDot : ' + path.relative(this.current_path, files.getCurrentDirectoryBase() + abs_path.substring(2)))
            return path.relative(this.current_path, files.getCurrentDirectoryBase() + abs_path.substring(2))
        } else {
            console.log('relativePath : ' + path.relative(this.current_path, files.getCurrentDirectoryBase() + abs_path))
            return path.relative(this.current_path, files.getCurrentDirectoryBase() + abs_path)
        }
        */
    }

    runGeneric(runConfig) {
        let collection = this.get_relative_path(runConfig.collection)
        var file_name = collection.split("/")
        let newmanRunConfig = {
            collection: require(collection),
            reporters: this.reporters_list,
            reporter: {
                html: {
                    export: this.newman_html_report_path.concat(file_name[file_name.length - 1]).concat('.html') // If not specified, the file will be written to `newman/` in the current working directory.
                },
                allure: {
                    export: this.allure_report_path
                },
                json: {
                    export: this.newman_json_report_path.concat(file_name[file_name.length - 1]).concat('.json')
                }
            }
        }

        if (typeof runConfig.environment !== 'undefined') {
            console.log("Using environment")
            newmanRunConfig.environment = this.get_relative_path(runConfig.environment)
        }

        if (typeof runConfig.folder !== 'undefined') {
            console.log("Using folder")
            newmanRunConfig.folder = runConfig.folder
        }

        if (typeof runConfig.iterationCount !== 'undefined') {
            console.log("Using iterationCount")
            newmanRunConfig.iterationCount = runConfig.iterationCount
        }

        if (typeof runConfig.iterationData !== 'undefined') {
            console.log("Using iterationData")
            newmanRunConfig.iterationData = this.get_relative_path(runConfig.iterationData)
        }

        if (typeof runConfig.insecure !== 'undefined') {
            console.log("Using insecure")
            newmanRunConfig.insecure = runConfig.insecure
        }

        newman.run(newmanRunConfig, function (err) {
            if (err) { throw err; }
            console.log('Collection run complete!');
        });
    }

    removeDirectory(directory) {
        // directory = this.get_relative_path(directory)
        try {
            fs.readdir(directory, (err, files) => {
                if (err) throw err;
                console.log('Removing files from: ' + directory)
                for (const file of files) {
                    if (file != '.keep') {
                        fs.unlink(path.join(directory, file), err => {
                            if (err) {
                                console.log("Cannot clear the files from the directory using rimraf");
                                rimraf(directory + '/*', function () { console.log('done'); });
                            }
                        });
                    }
                }
            });
        }
        catch (e) {
            console.log("Cannot clear the files from the directory using rimraf");
            rimraf(directory + '/*', function () { console.log('done'); });
        }
    }

    clearResultsFolder() {
        this.removeDirectory(files.getCurrentDirectoryBase() + this.allure_report_path)
        this.removeDirectory(files.getCurrentDirectoryBase() + this.newman_html_report_path)
        this.removeDirectory(files.getCurrentDirectoryBase() + this.newman_json_report_path)
    }
}

module.exports = NewmanConfig