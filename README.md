# BADMINTON ARENA

A browser-based 3D badminton prototype built with Three.js.

## Current prototype
- 3D court, net, lighting, player figures and shuttlecock
- Main menu and CPU practice entry
- Keyboard controls: WASD / arrow keys to move, Space or J to hit
- Touch controls for phones and tablets
- Simple shuttle flight arc and score display
- Player shirt color selection

## Run locally
Open `index.html` through a local web server (ES modules do not reliably run from `file://`). In VS Code, use Live Server and choose **Open with Live Server**.

## Publish with GitHub Pages
1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions**.
3. Push to the `main` branch; the included workflow deploys the site.
4. Open the Pages URL shown in Settings → Pages.

## Important status
This is an early prototype, not a finished competitive game. The current shuttle movement is a simplified scripted arc rather than a validated badminton aerodynamic simulation. The CPU, official scoring/rules, realistic character models and animations, singles/doubles, and online multiplayer still need further development. Online play will require a separate real-time server; GitHub Pages alone cannot host it.
