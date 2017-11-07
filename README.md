GitHub Webhook Puller
=====================
This is a simple JavaScript application that listens for `POST` requests from GitHub webhooks and then pulls a git repository in the desired location.

## Installation

1. First clone this repo with `git clone https://github.com/mfrancis95/webhook-puller.git` and navigate to the directory
2. Edit the `config.json`, for example
```json
{
    "branch": "master",
    "credentials": {
        "username": "mfrancis95",
        "password": "HAHA, you think I would put my password!"
    },
    "localRepo": "/home/user/repo",
    "port": "4242",
    "remoteRepo": {
        "name": "webhook-puller",
        "username": "mfrancis95"
    },
    "route": "/payload",
    "secret": "(Optional) Secret token associated with the webhook to validate the payload"
}
```
If you are uncomfortable putting your password, then you can either
  a. Get a Personal Access Token by going to `Settings>Developer Settings>Personal Access Tokens>Generate new token`, or
  b. remove that line and you will be prompted (with the text hidden) for your password when you run the app.<br>

You can make the `route` whatever you want (what you set in GitHub).

3. Install NodeJS, instructions to do so can be found [here](https://nodejs.org/en/download/package-manager/).
4. Run `npm install --save` to install the dependencies and save them to the directory.
5. It is suggested that you install `screen` (`sudo apt-get install screen` on Debian), that way you can run the app in it's own terminal. To do this run `screen -S webhook-puller node webhook-puller.js`
6. Now setup your preferred way of forwarding the correct traffic to the app

#### Recommended Setup

This section will cover setup using NGINX, these instructions are tailored toward auto pulling to keep a website up to date.

1. Configure the DNS settings for your domain to add an `A` record to point `webhook.yourdomain.com` to your web-server.
2. Create an NGINX configuration `webhook.yourdomain.com`, use this as an example.
```
server {
        listen 80;
        server_name webhook.yourdomain.com;

        location / {
                proxy_pass http://127.0.0.1:8001;
        }
```
    a. If you would like to secure this with SSL, setup `certbot`, although this will not be covered here.
3. Run the app on port `8001` (or change the port in the `webhook.yourdomain.com` and `config.json` in the `webhook-puller` directory).
4. Send a webhook request in GitHub

#### Configuring GitHub

1. Navigate to the GitHub repository you wish to create a webhook for
2. Navigate to `Settings>Webhooks` click `Add webhook`.
3. For `Payload URL`, input `https://webhook.yourdomain.com` or just `http://` if you didn't decide to setup SSL.
4. Change `Content type` to `application/json`
5. For `Secret`, although this isn't *necessary*, it is ***highly*** recommended, since it will prevent counterfeit payloads.
    - Whatever you put in this field, you will have to add that to `config.json` or input it when starting the app if you do not wish to store it as plaintext.
 6. Click `Add webhook` and hopefully the test payload will succeed, if not, reread the instructions. Below is a list of possible errors and what *may* be causing them.
    1. `502 Bad Gateway`: This is due to NGINX not being able to process the request and not be able to forward to the app
    2. `404`: This could be due to the fact that, also, NGINX cannot forward your request properly, and can be caused if you decided to use the link `https://yourdomain.com/payload` instead of `https://webhook.yourdomain.com`
    3. `200`: This is the error that the app actually throws when it encounters an error, one possible error is that it doesn't have permission to pull into the directory the local repo is located. A suggested fix is to have the repo in your local home directory and to create a [symbolic link](http://man7.org/linux/man-pages/man1/ln.1.html) to your site's root folder.
