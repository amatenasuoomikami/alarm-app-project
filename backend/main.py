import json
import logging
from fastapi import FastAPI, HTTPException, Path, Request
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

app = FastAPI()

# CORS許可（ローカル開発用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# パターンモデル
class PatternTime(BaseModel):
    time: str
    sound: str

class Pattern(BaseModel):
    pattern_id: str
    name: str
    color: str
    times: List[PatternTime]

# メモリ上のデータベース
patterns_db: Dict[str, List[Pattern]] = {}

@app.get("/alarms")
async def alarms():
    return {"message": "Hello from FastAPI on Lambda!"}

@app.get("/")
async def root():
    return {"message": "Root path of FastAPI on Lambda"}

@app.get("/users/{user_id}/patterns")
def get_patterns(user_id: str):
    return {"patterns": patterns_db.get(user_id, [])}

@app.post("/users/{user_id}/patterns")
def create_pattern(user_id: str, pattern: Pattern):
    if user_id not in patterns_db:
        patterns_db[user_id] = []
    patterns_db[user_id].append(pattern)
    return {"pattern_id": pattern.pattern_id}

handler = Mangum(app)

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    try:
        return handler(event, context)
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }