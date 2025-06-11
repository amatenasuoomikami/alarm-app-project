from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from ..models.models import Alarm, User
from .auth import get_current_user
import uuid

router = APIRouter()

# 開発用の一時的なアラームデータベース
alarms_db: Dict[str, List[Alarm]] = {}

@router.get("/alarms", response_model=List[Alarm])
async def get_alarms(current_user: User = Depends(get_current_user)):
    return alarms_db.get(current_user.id, [])

@router.post("/alarms", response_model=Alarm)
async def create_alarm(alarm: Alarm, current_user: User = Depends(get_current_user)):
    if current_user.id not in alarms_db:
        alarms_db[current_user.id] = []
    
    # IDを自動生成
    alarm.id = str(uuid.uuid4())
    alarm.user_id = current_user.id
    alarm.created_at = datetime.utcnow()
    alarm.updated_at = datetime.utcnow()
    
    alarms_db[current_user.id].append(alarm)
    return alarm

@router.get("/alarms/{alarm_id}", response_model=Alarm)
async def get_alarm(alarm_id: str, current_user: User = Depends(get_current_user)):
    user_alarms = alarms_db.get(current_user.id, [])
    for alarm in user_alarms:
        if alarm.id == alarm_id:
            return alarm
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Alarm not found"
    )

@router.put("/alarms/{alarm_id}", response_model=Alarm)
async def update_alarm(
    alarm_id: str,
    updated_alarm: Alarm,
    current_user: User = Depends(get_current_user)
):
    user_alarms = alarms_db.get(current_user.id, [])
    for i, alarm in enumerate(user_alarms):
        if alarm.id == alarm_id:
            updated_alarm.user_id = current_user.id
            updated_alarm.id = alarm_id
            updated_alarm.created_at = alarm.created_at
            updated_alarm.updated_at = datetime.utcnow()
            alarms_db[current_user.id][i] = updated_alarm
            return updated_alarm
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Alarm not found"
    )

@router.delete("/alarms/{alarm_id}")
async def delete_alarm(alarm_id: str, current_user: User = Depends(get_current_user)):
    user_alarms = alarms_db.get(current_user.id, [])
    for i, alarm in enumerate(user_alarms):
        if alarm.id == alarm_id:
            del alarms_db[current_user.id][i]
            return {"message": "Alarm deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Alarm not found"
    ) 