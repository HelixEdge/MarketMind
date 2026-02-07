from fastapi import APIRouter, HTTPException, Depends, status

from app.models.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse,
)
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register(req: UserRegisterRequest):
    db = get_db()
    # Check existing user
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(req.password)
    cursor = await db.execute(
        "INSERT INTO users (email, hashed_password, display_name) VALUES (?, ?, ?)",
        (req.email, hashed, req.display_name),
    )
    await db.commit()
    user_id = cursor.lastrowid

    token = create_access_token({"user_id": user_id, "email": req.email})
    return AuthResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=req.email, display_name=req.display_name),
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: UserLoginRequest):
    db = get_db()
    cursor = await db.execute(
        "SELECT id, email, hashed_password, display_name, created_at FROM users WHERE email = ?",
        (req.email,),
    )
    row = await cursor.fetchone()
    if not row or not verify_password(req.password, row["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": row["id"], "email": row["email"]})
    return AuthResponse(
        access_token=token,
        user=UserResponse(
            id=row["id"],
            email=row["email"],
            display_name=row["display_name"],
            created_at=row["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
async def me(user=Depends(get_current_user)):
    return UserResponse(**user)


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
