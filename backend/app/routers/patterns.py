from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from ..models.models import Pattern, User, PatternTime
from ..schemas.pattern import PatternCreate
from .auth import get_current_user
import uuid

router = APIRouter()

# 開発用の一時的なパターンデータベース
patterns_db: Dict[str, List[Pattern]] = {}

@router.get("/patterns")
async def get_patterns(current_user: User = Depends(get_current_user)):
    patterns = patterns_db.get(current_user.id, [])
    return {"patterns": patterns}

@router.post("/patterns", response_model=Pattern)
async def create_pattern(pattern_data: PatternCreate, current_user: User = Depends(get_current_user)):
    if current_user.id not in patterns_db:
        patterns_db[current_user.id] = []
    
    # PatternTimeCreateからPatternTimeに変換
    pattern_times = [
        PatternTime(
            time=time_data.time,
            sound=time_data.sound,
            volume=time_data.volume,
            gradual_increase=time_data.gradual_increase,
            snooze_duration=time_data.snooze_duration
        )
        for time_data in pattern_data.times
    ]
    
    # 新しいPatternオブジェクトを作成
    pattern = Pattern(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=pattern_data.name,
        description=pattern_data.description,
        color=pattern_data.color,
        times=pattern_times,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    patterns_db[current_user.id].append(pattern)
    return pattern

@router.get("/patterns/{pattern_id}", response_model=Pattern)
async def get_pattern(pattern_id: str, current_user: User = Depends(get_current_user)):
    user_patterns = patterns_db.get(current_user.id, [])
    for pattern in user_patterns:
        if pattern.id == pattern_id:
            return pattern
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Pattern not found"
    )

@router.put("/patterns/{pattern_id}", response_model=Pattern)
async def update_pattern(
    pattern_id: str,
    pattern_data: PatternCreate,
    current_user: User = Depends(get_current_user)
):
    user_patterns = patterns_db.get(current_user.id, [])
    for i, pattern in enumerate(user_patterns):
        if pattern.id == pattern_id:
            # PatternTimeCreateからPatternTimeに変換
            pattern_times = [
                PatternTime(
                    time=time_data.time,
                    sound=time_data.sound,
                    volume=time_data.volume,
                    gradual_increase=time_data.gradual_increase,
                    snooze_duration=time_data.snooze_duration
                )
                for time_data in pattern_data.times
            ]
            
            # 既存パターンを更新
            updated_pattern = Pattern(
                id=pattern_id,
                user_id=current_user.id,
                name=pattern_data.name,
                description=pattern_data.description,
                color=pattern_data.color,
                times=pattern_times,
                created_at=pattern.created_at,
                updated_at=datetime.utcnow()
            )
            patterns_db[current_user.id][i] = updated_pattern
            return updated_pattern
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Pattern not found"
    )

@router.delete("/patterns/{pattern_id}")
async def delete_pattern(pattern_id: str, current_user: User = Depends(get_current_user)):
    user_patterns = patterns_db.get(current_user.id, [])
    for i, pattern in enumerate(user_patterns):
        if pattern.id == pattern_id:
            del patterns_db[current_user.id][i]
            return {"message": "Pattern deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Pattern not found"
    ) 