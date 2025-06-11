from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class PatternTimeCreate(BaseModel):
    time: str
    sound: str = "default"
    volume: int = 100
    gradual_increase: bool = False
    snooze_duration: int = 5

class PatternCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: str
    times: List[PatternTimeCreate]

class PatternUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    times: Optional[List[PatternTimeCreate]] = None

class PatternResponse(BaseModel):
    patterns: List[dict]