from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends
import random
from datetime import datetime, timedelta
from datetime import datetime, timedelta, timezone
from fastapi_mail import FastMail, MessageSchema,ConnectionConfig
from sqlalchemy.orm import Session
from src.database.database import engine, get_db
from jose import jwt, JWTError
from src.database.user.models import User
import os
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


router = APIRouter(prefix="/auth", tags=["auth"])


JWT_SECRET = os.getenv("JWT_SECRET")  # better rename this
ALGORITHM = "HS256"

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("SENDER_MAIL"), # type: ignore
    MAIL_PASSWORD=os.getenv("APP_PASSWORD"),  # Gmail App Password # type: ignore
    MAIL_FROM=os.getenv("SENDER_MAIL"), # type: ignore
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

otp_store = {}

# ================= MODELS =================
class EmailRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

#----------Send OTP--------------------
@router.post("/send-otp")
async def send_otp(data: EmailRequest):
    try:
        otp = str(random.randint(100000, 999999))
        print(otp)
        otp_store[data.email] = {
            "otp": otp,
            "expires": datetime.now(timezone.utc) + timedelta(minutes=5)
        }

        message = MessageSchema(
            subject="Your OTP Code",
            recipients=[data.email], # type: ignore
            body=f"Your OTP is {otp}",
            subtype="plain" # type: ignore
        )

        fm = FastMail(conf)
        await fm.send_message(message)

        return {"message": "OTP sent successfully"}

    except Exception as e:
        print("EMAIL ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
#----------Verify OTP--------------------
@router.post("/verify-otp")
async def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    try:
        record = otp_store.get(data.email)

        if not record:
            raise HTTPException(status_code=400, detail="OTP not found")

        if record["expires"] < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="OTP expired")

        if record["otp"] != data.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # Create user in DB if not already exists
        existing_user = db.query(User).filter(User.email == data.email).first()
        if not existing_user:
            new_user = User(email=data.email)
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user_id = new_user.id
        else:
            user_id = existing_user.id 

        token = jwt.encode(
            {"sub": data.email, "exp": datetime.now(timezone.utc) + timedelta(days=1)},
            JWT_SECRET,  # type: ignore
            algorithm=ALGORITHM
        )

        del otp_store[data.email]
        # print(token)

        user = {
            "email": data.email,
            "id": user_id
        }

        return {"access_token": token, "token_type": "bearer", "user": user}
    
    except HTTPException:
        raise
    except Exception as e:
        print("VERIFY ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    

#----------Verify Token-------------------
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM]) # type: ignore
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")




@router.get("/me")
def get_me(token=Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == token["sub"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(db_user.id),
        "name": db_user.name,
        "email": db_user.email,
        "avatar_url": db_user.avatar_url,
    }