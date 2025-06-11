import json
import logging
from fastapi import FastAPI
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, patterns, calendar, alarms

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

app = FastAPI(title="Alarm App API")

# CORS許可（ローカル開発用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(auth.router, tags=["authentication"])
app.include_router(patterns.router, prefix="/api", tags=["patterns"])
app.include_router(calendar.router, prefix="/api", tags=["calendar"])
app.include_router(alarms.router, prefix="/api", tags=["alarms"])

@app.get("/")
async def root():
    return {"message": "Welcome to Alarm App API"}

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