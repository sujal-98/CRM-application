# XenoCRM Frontend

A modern React-based CRM system with customer segmentation and campaign management capabilities.

## Features

- **Dashboard**
  - Real-time statistics for customers and campaigns
  - Performance metrics for last 10 campaigns
  - Recent segments and campaign overview
  - Visual analytics and charts

- **Customer Management**
  - Customer profile viewing and management
  - Customer activity tracking
  - Order history and spending analysis

- **Segmentation**
  - Dynamic segment builder with drag-and-drop interface
  - Multiple condition support (Total Spend, Days Since Last Order, etc.)
  - Real-time segment preview
  - Save and manage segments

- **Campaign Management**
  - Campaign history view
  - Campaign performance metrics
  - Success/Failure rate tracking
  - Message delivery statistics

## Tech Stack

- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls
- Chart.js for analytics

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. Get your Google OAuth Client ID:
   - Go to the [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to Credentials
   - Create an OAuth 2.0 Client ID
   - Add authorized JavaScript origins (e.g., http://localhost:3000)
   - Copy the client ID to your `.env` file

4. Start the development server:
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
