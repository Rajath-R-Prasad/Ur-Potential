# UrPotential

An ADHD-friendly full-stack productivity web app designed with a focus on task initiation and 2-minute activation sprints rather than complex to-do lists.

## Features

- **2-Minute Activation**: A focus mode that starts a 3-2-1 countdown followed by a gentle 2-minute timer that encourages task initiation.
- **Dopamine-Friendly UI**: Premium dark mode aesthetic with smooth animations natively handled by Framer Motion.
- **FastAPI Backend**: Fast, lightweight API with SQLite and secure JWT authentication.
- **React Frontend**: Clean user interface built with Vite, Tailwind CSS, and Lucide React Icons.

## File Structure

```
UrPotential/
├── api/             # FastAPI backend (optimized for Vercel Serverless Functions)
│   ├── index.py     # Main application and endpoints
│   ├── auth.py      # JWT Auth logic
│   ├── database.py  # SQLite DB connection
│   ├── models.py    # SQLAlchemy models
│   └── schemas.py   # Pydantic schema models
├── frontend/        # React + Vite frontend application
│   ├── src/
│   │   ├── api.js   # Utility for API requests
│   │   ├── App.jsx  # Main component and routes
│   │   ├── index.css
│   │   ├── contexts/AuthContext.jsx
│   │   └── pages/   # Home, Login, Signup, Focus routines
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── vercel.json      # Configuration for Vercel deployment
└── requirements.txt # Python dependencies
```

## How to Run Locally

### 1. Run the Backend
Ensure you have Python 3.9+ installed.
```bash
# Navigate to project root
cd UrPotential

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend dev server via uvicorn (runs on port 8000)
uvicorn api.index:app --reload
```

### 2. Run the Frontend
In a new terminal window:
```bash
# Navigate to the frontend directory
cd UrPotential/frontend

# Install node modules
npm install

# Run the vite dev server (runs by default on port 5173)
npm run dev
```

Visit `http://localhost:5173` in your browser.

## How to Deploy on Vercel

1. **Push to GitHub**: Initialize a Git repository in `UrPotential`, commit the files, and push them to a brand new GitHub repo.
2. **Import to Vercel**: 
   - Go to [vercel.com](https://vercel.com/) and create a new project by importing your new GitHub repo.
   - **Framework Preset**: Vercel should auto-detect `Vite` for the frontend if you specify the Root Directory. Instead, keep the Root Directory as `.` (the main repository root), and Vercel will process the `vercel.json` file.
   - **Environment Variables**: Add a new environment variable `JWT_SECRET_KEY` and give it a randomly generated secure string value. 
3. **Deploy**: Hit Deploy. Vercel will use Python serverless functions for `/api` routes as documented in `vercel.json`, and `@vercel/static-build` for your React application found in `/frontend`. Wait for the build to finish.
