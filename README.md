# Juicy OBS Notifications

A Vue.js application for displaying tip notifications in OBS for Juicy streams.

## Prerequisites

### Installing Node.js and npm

#### Windows

1. Download the Node.js installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the installation wizard
3. Verify installation by opening Command Prompt and running:

   ```bash
   node --version
   npm --version
   ```

#### macOS

1. Using Homebrew (recommended):

   ```bash
   brew install node
   ```

2. Or download the installer from [nodejs.org](https://nodejs.org/)
3. Verify installation by opening Terminal and running:

   ```bash
   node --version
   npm --version
   ```

#### Linux (Ubuntu/Debian)

1. Using apt:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Verify installation:

   ```bash
   node --version
   npm --version
   ```

## Project Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/juicy-obs-notifications.git
   cd juicy-obs-notifications
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy the `.env.example` file to `.env`:

     ```bash
     cp .env.example .env
     ```

   - Open `.env` in a text editor
   - Replace the session ID with your stream's session ID:
  
     ```bash
     VITE_SESSION_ID=your_session_id_here
     ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## OBS Setup

1. Add a new Browser Source in OBS
2. Set the URL to: `http://localhost:5173`
3. Set the width to 1920 and height to 1080
4. Enable "Shutdown source when not visible"
5. Enable "Refresh cache when page is active"

## Features

- Real-time tip notifications
- Smooth animations
- Queue system for multiple tips
- Transparent background for OBS integration

## Troubleshooting

- If notifications aren't showing:
  - Check your session ID in the `.env` file
  - Ensure the development server is running
  - Check browser console for errors
  - Verify OBS browser source settings

- If you need to change the session ID:
  1. Stop the development server
  2. Update the `VITE_SESSION_ID` in `.env`
  3. Restart the development server

## Development

- The application uses Vue 3 with Vite
- Main component: `src/components/Alert.vue`
- Environment variables are configured in `.env`
- API proxy is configured in `vite.config.js`

## License

MIT License - See LICENSE file for details
