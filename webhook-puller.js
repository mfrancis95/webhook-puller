const config = require(process.argv[2] || "./config.json");
const exec = require("child_process").exec;
const app = require("express")();

if (!config.branch) {
    config.branch = "master";
}

if (config.secret) {
    app.use(require("express-x-hub")({
        secret: config.secret
    }));
}

app.post(config.route || "/", (request, response) => {
    if (!config.secret || (request.isXHub && request.isXHubValid())) {
        var child = exec(`git pull https://${config.credentials.username}:${config.credentials.password}@github.com/${config.remoteRepo.username}/${config.remoteRepo.name}.git ${config.branch}`, {
            cwd: config.localRepo
        }, (error) => {
            if (error) {
                response.status(400).send();
            }
            else {
                response.status(200).send();
            }
        });
        child.stdout.on("data", log);
        child.stderr.on("data", log);
    }
    else {
        response.status(400).send();
    }
});

app.listen(config.port, () => {
    log("Started webhook server.");
});

function log(message) {
    console.log(`${new Date()} - ${message}`);
}
