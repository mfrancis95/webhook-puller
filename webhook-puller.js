const config = require(process.argv[2] || "./config.json");
const readlineSync = require("readline-sync");
const exec = require("child_process").exec;
const app = require("express")();

if (!config.branch) {
    config.branch = "master";
}

if (!config.credentials) {
    config.credentials = {
        username: readlineSync.question("Enter your GitHub username: "),
        password: readlineSync.question("Enter your GitHub password: ", {
            hideEchoBack: true,
            mask: ""
        })
    };
}
else if (!config.credentials.password) {
    config.credentials.password = readlineSync.question("Enter your GitHub password: ", {
        hideEchoBack: true,
        mask: ""
    });
}

if (config.secret) {
    app.use(require("express-x-hub")({
        secret: config.secret
    }));
}

app.post(config.route || "/", (request, response) => {
    if (!config.secret || (request.isXHub && request.isXHubValid())) {
        const child = exec(`git pull https://${config.credentials.username}:${config.credentials.password}@github.com/${config.remoteRepo.username}/${config.remoteRepo.name}.git ${config.branch}`, {
            cwd: config.localRepo
        }, error => {
            if (error) {
                response.status(400).end();
            }
            else {
                response.status(200).end();
            }
        });
        child.stdout.on("data", log);
        child.stderr.on("data", log);
    }
    else {
        response.status(400).end();
    }
});

app.listen(config.port, () => {
    log("Started webhook server.");
});

function log(message) {
    console.log(`${new Date()} - ${message}`);
}
