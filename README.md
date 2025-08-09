# Chatroom

A beautiful, modern chatroom application with user authentication featuring a smooth pastel color palette.

## Features

- 🎨 Modern, smooth UI with pastel colors
- 🔐 User registration and login
- 💾 Secure password storage with bcrypt
- 🎭 Animated background shapes
- 📱 Responsive design
- ✨ Smooth animations and transitions

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with your name and password
2. **Sign In**: Log in with your existing credentials
3. **Hello Page**: After successful authentication, you'll be redirected to a welcome page

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Authentication**: bcryptjs, express-session
- **Styling**: Custom CSS with glassmorphism effects and animations

## Project Structure

```
├── server.js           # Express server and API routes
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html      # Main login/signup page
│   ├── hello.html      # Welcome page after login
│   ├── styles.css      # Main page styles
│   ├── hello-styles.css # Hello page styles
│   ├── script.js       # Main page JavaScript
│   └── hello-script.js # Hello page JavaScript
└── README.md          # This file
```

## Future Enhancements

- Add more content to the dashboard
- Implement user profiles
- Add password reset functionality
- Database integration for persistent storage
