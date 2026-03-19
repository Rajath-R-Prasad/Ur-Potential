from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import os

from api.database import engine, Base, get_db
from api.models import User, Task, Session as DBSession
from api.schemas import UserCreate, UserResponse, TaskCreate, TaskResponse, TaskUpdate, Token, SessionCreate, SessionResponse
from api.auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="UrPotential API", version="1.0.0")

# Setup CORS
origins = [
    "http://localhost:5173", # Vite local frontend
    "https://urpotential.vercel.app", 
    "*" # Can be restricted for production, allowing all for now to avoid issues
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.created_at.desc()).all()

@app.post("/api/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_task = Task(**task.dict(), user_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}

@app.post("/api/sessions", response_model=SessionResponse)
def log_session(session: SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify task belongs to user
    task = db.query(Task).filter(Task.id == session.task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    new_session = DBSession(**session.dict(), user_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime, date
    from sqlalchemy import func
    
    # Get total completed tasks today
    today = date.today()
    completed_today = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_completed == True,
    ).filter(
        func.date(Task.created_at) == today
    ).count() # simplistic, might need dialect-specific date extraction for robust production
    # Let's count all completed to be safe for sqlite portability
    all_completed = db.query(Task).filter(Task.user_id == current_user.id, Task.is_completed == True).count()
    
    return {
        "completed_today": completed_today,
        "completed_all_time": all_completed,
        "streak": 1 # To calculate actual streak requires more complex logic. Leaving as 1 for now.
    }
