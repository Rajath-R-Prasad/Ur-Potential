from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TaskBase(BaseModel):
    title: str

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    is_completed: bool
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    task_id: int
    duration: int
    completed: bool

class SessionResponse(SessionCreate):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True
