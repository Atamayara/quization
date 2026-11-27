# Quization

Quization is a real-time quiz buzzer system. Players use their phones as buzzers, while the host controls the quiz and a display screen shows questions, answers, and scores. The screens communicate over WebSockets.

[日本語版 README](README_ja.md)

## Features

- Player registration and rejoining (player credentials are stored in local storage)
- Real-time communication over WebSockets
- Buzzer order and response-time tracking
- Correct/incorrect marking and score tracking
- Rest periods after incorrect answers
- Configurable question-reading speed and points
- A display screen for questions, answers, player scores, and buzzer effects
- Sound effects for correct/incorrect answers, buzzes, and quiz starts

## Screens

| Screen | URL | Purpose |
| --- | --- | --- |
| Player | `/` | Enter a nickname and buzz in |
| Host | `/host/` | Control questions, settings, and answer marking |
| Display | `/view/` | Show questions, answers, buzzer effects, and scores |

The host and display screens can connect only when the server sees their connection as coming from localhost. Open both screens in a browser on the host PC using `localhost`. Players can connect from other devices that can reach the server.

## Technology

- Frontend: React 19, TypeScript, Vite, React Router
- Backend: Deno
- Communication: WebSocket
- Other: Deno Standard Library

## Requirements

- Node.js and npm
- Deno
- A modern web browser

This guide assumes the server, host screen, and display screen run on a host PC, while players join from phones or other devices on the same LAN. The host and display screens must be opened on the host PC through localhost; they cannot be operated from another LAN device.

## Setup and Usage

### 1. Build the client

From the repository root on the host PC, install the client dependencies and build the frontend:

```bash
cd client
npm ci
npm run build
```

The build output is written to `server/public`. Rebuild the client before starting the server whenever you change frontend source files.

### 2. Prepare quiz data

Place the quiz data in `server/quiz.tsv`. This file is ignored by `.gitignore` and is not included when you clone the repository, so create it yourself using the format shown below.

### 3. Start the server on the host PC

Start the server from a terminal and leave it running:

```bash
cd server
deno task dev
```

The server listens on port `8000`. On the host PC, open the host and display screens in a browser:

- Host: `http://localhost:8000/host/`
- Display: `http://localhost:8000/view/`

### 4. Join from player devices on the LAN

Find the host PC's LAN IP address, then open `http://<host-PC-IP>:8000/` in a browser on each phone or other player device. For example, if the host PC's IP address is `192.168.1.20`, use `http://192.168.1.20:8000/`. Player devices must be connected to the same LAN as the host PC.

On macOS, you can check the Wi-Fi IP address in Terminal with the following command. The network interface name may differ depending on your setup.

```bash
ipconfig getifaddr en0
```

### Troubleshooting

- Check the server terminal for errors.
- Make sure the host PC and player devices are on the same LAN. Guest Wi-Fi and networks that isolate devices may prevent connections.
- Make sure the host PC's firewall allows LAN connections to TCP port `8000`.
- Open the host and display screens on the host PC using `localhost`. Opening them via the LAN IP address will fail because of the server's localhost-only restriction.

This server is intended for use on a LAN. Do not expose it directly to the internet by configuring router port forwarding.

### Development notes

Frontend source files are in `client/src`, and the build output is in `server/public`.

The WebSocket endpoint uses the hostname in the page URL and port `8000`. The current client uses `ws://`; WebSocket connections may be blocked as mixed content when the page is served over HTTPS.

## Quiz Data

Create or edit `server/quiz.tsv`. Each line must contain the question and answer separated by a tab. Save the file as UTF-8.

```tsv
What is the capital of Japan?	Tokyo
Which is the largest planet in the Solar System?	Jupiter
```

The server reads the file at startup. Restart the server after changing the quiz data.

## How to Play

1. Open the display and host screens on the host PC.
2. On each player device, open `http://<host-PC-IP>:8000/` and join with a nickname.
3. In the host screen, press `▶️` to start reading the question.
4. Players press their buzzer buttons.
5. Mark the first player shown as correct (`⭕️`) or incorrect (`✖️`) on the host screen.
6. Press `⏭️` to move to the next question.

The host screen lets you change:

- `Speed`: question-reading speed
- `Rest`: number of questions a player must sit out after an incorrect answer
- `Point`: points awarded or deducted for correct and incorrect answers
- Individual player scores

## Scripts

### Client

Run these commands from the `client` directory:

```bash
npm run dev     # Start the Vite development server
npm run build   # Build for production
npm run lint    # Run ESLint
npm run preview # Preview the production build
```

### Server

Run this command from the `server` directory:

```bash
deno task dev
```

## Project Structure

```text
.
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Player, host, and display screens
│       └── hook/    # WebSocket and sound-effect hooks
├── server/          # Deno server
│   ├── public/      # Built frontend assets
│   ├── main.ts
│   ├── gameMaster.ts
│   └── quiz.tsv
└── shared/
    └── types.ts     # Types shared by the client and server
```

## License

[MIT License](LICENSE)
