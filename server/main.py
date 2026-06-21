from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import random
from datetime import datetime, timedelta
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jose import jwt
import os
from dotenv import load_dotenv
import uvicorn


load_dotenv() 

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello world"}


# ================= CONFIG =================
JWT_SECRET = os.getenv("JWT_SECRET")  # better rename this
ALGORITHM = "HS256"

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("SENDER_MAIL"),
    MAIL_PASSWORD=os.getenv("APP_PASSWORD"),  # Gmail App Password
    MAIL_FROM=os.getenv("SENDER_MAIL"),
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

# ================= SEND OTP =================
@app.post("/send-otp")
async def send_otp(data: EmailRequest):
    try:
        otp = str(random.randint(100000, 999999))

        otp_store[data.email] = {
            "otp": otp,
            "expires": datetime.utcnow() + timedelta(minutes=5)
        }

        message = MessageSchema(
            subject="Your OTP Code",
            recipients=[data.email],
            body=f"Your OTP is {otp}",
            subtype="plain"
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
    record = otp_store.get(data.email)

    if not record:
        raise HTTPException(status_code=400, detail="OTP not found")

    if record["expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    if record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    token = jwt.encode(
        {"sub": data.email, "exp": datetime.utcnow() + timedelta(days=1)},
        JWT_SECRET, 
        algorithm=ALGORITHM
    )

    del otp_store[data.email]

    return {"access_token": token}
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

