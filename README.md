# Minecraft GitHub Actions Server

This repository contains the configuration for automatically deploying and managing a Minecraft server using GitHub Actions and playit.gg.

## Features

- Automated server deployment
- Easy server management through GitHub Actions
- Remote access using playit.gg tunneling service

## Setup

1. Fork this repository.
2. Create two repository secrets:
   - `FINE_GRAINED_PAT`:
     - Generate a Fine-Grained Personal Access Token (PAT) with full read and write access to the repository.
     - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens.
     - Create a new token with the necessary permissions.
     - Copy the generated token.
     - In your forked repository, go to Settings > Secrets and variables > Actions.
     - Create a new repository secret named `FINE_GRAINED_PAT` and paste the token as its value.
   - `PLAYIT_SECRET`:
     - Install and run the playit.gg tunnel service on your local machine.
     - Extract the data from the generated `playit.toml` file.
     - In your forked repository, go to Settings > Secrets and variables > Actions.
     - Create a new repository secret named `PLAYIT_SECRET` and paste the extracted data as its value.
3. Customize the server settings in the `server.properties` file according to your preferences.
4. Push your changes to the repository to trigger the GitHub Actions workflow.

## Usage

- The server will automatically start when you push changes to the repository.
- You can manage the server using GitHub Actions workflows in the "Actions" tab.
- Access your server using the [playit.gg](https://playit.gg) tunnel address provided in the workflow logs.

## Important Notes

- Public repositories get 16 GB of memory for GitHub Actions, while private repositories only get 8 GB.
- It's possible to upload and download server data to a private repo while hosting the server on a public repo. (This feature is not demonstrated here; you'll need to figure out the implementation yourself.)

## Demos

- Main: overview-manufacturer.gl.joinmc.link
- Hypixel Skywars clone: 147.185.221.21:56392

## Contributing

Contributions are **NOT** allowed.

## License

This project is not licensed. Use it as you wish.
