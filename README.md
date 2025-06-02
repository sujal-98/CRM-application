# XenoCRM Frontend

A modern React-based CRM application with customer segmentation, campaign management, and analytics capabilities.

![readme1](https://github.com/user-attachments/assets/7d0b2e65-7680-4764-8615-d61025f3ea63)
![readm2](https://github.com/user-attachments/assets/833b249e-dfeb-42b8-8b97-880b2660c59c)
![readm3](https://github.com/user-attachments/assets/d3104ad7-8587-482a-9e37-571dd2a33059)
![readm4](https://github.com/user-attachments/assets/b4d0ac86-2452-49fd-9558-d7713bd98c2e)

## Features

### Customer Segmentation
- Dynamic segment builder with multiple conditions
- Real-time segment preview
- Advanced filtering options:
  - Total spend
  - Number of visits
  - Total orders
  - Average order value
  - Days since last order
- Logical operators (AND/OR) support
- Instant audience size calculation
- Detailed segment analytics

### Campaign Management
- Create campaigns from segments
- Campaign performance tracking
- Message delivery status monitoring
- Success/failure rate analytics
- Batch processing support

### Dashboard
- Real-time analytics
- Customer metrics
- Campaign performance
- Segment distribution
- Recent activity tracking

## Tech Stack

- **React 18+**
- **Material-UI (MUI) v5**
- **Redux Toolkit** for state management
- **Axios** for API communication
- **React Router v6** for navigation
- **Notistack** for notifications

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
