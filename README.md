# XenoCRM Frontend

A modern CRM platform built with React and Material-UI, featuring customer segmentation, campaign management, and AI-powered insights.

## Features

- 🔐 Google OAuth Authentication
- 📊 Modern Dashboard with Analytics
- 👥 Customer Segmentation
- 📨 Campaign Management
- 📈 Campaign Performance Tracking
- 🤖 AI-Powered Insights
- 📱 Responsive Design

## Tech Stack

- React 18
- Material-UI (MUI)
- React Router
- Recharts for Data Visualization
- Google OAuth
- Axios for API Communication

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Google Cloud Platform account (for OAuth)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. Get your Google OAuth Client ID:
   - Go to the [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to Credentials
   - Create an OAuth 2.0 Client ID
   - Add authorized JavaScript origins (e.g., http://localhost:3000)
   - Copy the client ID to your `.env` file

5. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   └── segments/       # Segment builder components
├── pages/              # Page components
├── theme/              # MUI theme configuration
├── utils/              # Utility functions
└── App.js             # Main application component
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from create-react-app

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
