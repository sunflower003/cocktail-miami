# Cocktail Miami

## Setup Instructions

### Backend Setup

1. **Clone repository và navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file and add your actual values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `FROM_EMAIL`: Your verified sender email
   - Other configurations as needed

4. **Run development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and update `VITE_API_URL` if needed.

4. **Run development server**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Backend (Render)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

#### Frontend (Vercel)
1. Connect repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard

## Environment Variables

### Required Backend Variables
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Secret for JWT tokens
- `SENDGRID_API_KEY`: Email service API key
- `FROM_EMAIL`: Verified sender email

### Required Frontend Variables
- `VITE_API_URL`: Backend API URL

## Security Notes
- Never commit `.env` files to version control
- Use strong, unique values for `JWT_SECRET`
- Keep API keys secure and rotate them regularly
- Use environment-specific configurations