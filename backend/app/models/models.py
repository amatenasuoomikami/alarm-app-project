from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PatternTime(BaseModel):
    time: str
    sound: str
    volume: int = 100
    gradual_increase: bool = False
    snooze_duration: int = 5

class Pattern(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    color: str
    times: List[PatternTime]
    created_at: datetime
    updated_at: datetime

class CalendarEvent(BaseModel):
    id: str
    user_id: str
    pattern_id: str
    date: str
    note: Optional[str] = None

class CalendarEventCreate(BaseModel):
    pattern_id: str
    date: str
    note: Optional[str] = None

class Alarm(BaseModel):
    id: str
    user_id: str
    date: str
    time: str
    is_active: bool = True
    sound: str = "default"
    volume: float = 1.0
    snooze_duration: int = 5  # minutes
    created_at: datetime
    updated_at: datetime 