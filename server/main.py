from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import random
from datetime import datetime, timedelta
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jose import jwt
import os
from dotenv import load_dotenv
import uvicorn
from datetime import datetime, timedelta, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from fastapi import Depends

load_dotenv() 

app = FastAPI()




# ================= CONFIG =================
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


@app.get("/")
def read_root():
    return {"message": "Server running"}


# ================= Get Token =================

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM]) # type: ignore
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.get("/me")
def get_me(user=Depends(verify_token)):
    return {"email": user["sub"]}


# ================= SEND OTP =================

@app.post("/send-otp")
async def send_otp(data: EmailRequest):
    try:
        otp = str(random.randint(100000, 999999))

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

# ================= VERIFY OTP =================

@app.post("/verify-otp")
async def verify_otp(data: VerifyOtpRequest):
    try:
        record = otp_store.get(data.email)

        if not record:
            raise HTTPException(status_code=400, detail="OTP not found")

        if record["expires"] < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="OTP expired")

        if record["otp"] != data.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        token = jwt.encode(
            {"sub": data.email, "exp": datetime.now(timezone.utc) + timedelta(days=1)},
            JWT_SECRET,  # type: ignore
            algorithm=ALGORITHM
        )

        del otp_store[data.email]
        print(token)
        return {"access_token": token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        print("VERIFY ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

