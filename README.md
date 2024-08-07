# Minecraft GitHub Actions Server

This repository contains the configuration for automatically deploying and managing a Minecraft server using GitHub Actions and playit.gg.

## Features

- Automated server deployment
- Easy server management through GitHub Actions
- Remote access using playit.gg tunneling service

## Setup

1. Fork this repository.

2. Create two repository secrets:

   a. `FINE_GRAINED_PAT`:
   - Generate a Fine-Grained Personal Access Token (PAT) with full read and write access to the repository.
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens.
   - Create a new token with the necessary permissions.
   - Copy the generated token.
   - In your forked repository, go to Settings > Secrets and variables > Actions.
   - Create a new repository secret named `FINE_GRAINED_PAT` and paste the token as its value.

   b. `PLAYIT_SECRET`:
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

## Important Note

Public repositories get 16 GB of memory for GitHub Actions, while private repositories only get 8 GB.
## Demos
   main => overview-manufacturer.gl.joinmc.link
   
   hypixel skywars clone => 
## Contributing

Contributions Are **NOT** Allowed.

## License

This project is not licensed, use it how you want.
