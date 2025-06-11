from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from ..models.models import CalendarEvent, CalendarEventCreate, User
from .auth import get_current_user
import uuid

router = APIRouter()

# 開発用の一時的なカレンダーイベントデータベース
calendar_events_db: Dict[str, List[CalendarEvent]] = {}

@router.get("/calendar", response_model=List[CalendarEvent])
async def get_calendar_events(current_user: User = Depends(get_current_user)):
    return calendar_events_db.get(current_user.id, [])

@router.post("/calendar", response_model=CalendarEvent)
async def create_calendar_event(event_create: CalendarEventCreate, current_user: User = Depends(get_current_user)):
    if current_user.id not in calendar_events_db:
        calendar_events_db[current_user.id] = []
    
    # 完全なCalendarEventオブジェクトを作成
    event = CalendarEvent(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        pattern_id=event_create.pattern_id,
        date=event_create.date,
        note=event_create.note
    )
    
    calendar_events_db[current_user.id].append(event)
    return event

@router.get("/calendar/{event_id}", response_model=CalendarEvent)
async def get_calendar_event(event_id: str, current_user: User = Depends(get_current_user)):
    user_events = calendar_events_db.get(current_user.id, [])
    for event in user_events:
        if event.id == event_id:
            return event
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Calendar event not found"
    )

@router.put("/calendar/{event_id}", response_model=CalendarEvent)
async def update_calendar_event(
    event_id: str,
    updated_event: CalendarEvent,
    current_user: User = Depends(get_current_user)
):
    user_events = calendar_events_db.get(current_user.id, [])
    for i, event in enumerate(user_events):
        if event.id == event_id:
            updated_event.user_id = current_user.id
            updated_event.id = event_id
            calendar_events_db[current_user.id][i] = updated_event
            return updated_event
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Calendar event not found"
    )

@router.delete("/calendar/{event_id}")
async def delete_calendar_event(event_id: str, current_user: User = Depends(get_current_user)):
    user_events = calendar_events_db.get(current_user.id, [])
    for i, event in enumerate(user_events):
        if event.id == event_id:
            del calendar_events_db[current_user.id][i]
            return {"message": "Calendar event deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Calendar event not found"
    ) 