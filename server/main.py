from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import shutil
import os
import uuid
import zipfile
import traceback
from datetime import timedelta

from analyzer import YOLOAnalyzer
from intelligence import IntelligenceAgent
from auth import verify_password, get_password_hash, create_access_token, decode_access_token
from db import users_collection, sessions_collection, results_collection, create_user
from cache import cache

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await cache.connect()

@app.on_event("shutdown")
async def shutdown_event():
    from db import client as mongo_client
    mongo_client.close()
    await cache.close()
    print("Neural Engine Offline (Safe Shutdown)")

# OAuth2 Setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_uploads"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# ------------------ AUTH ENDPOINTS ------------------

@app.post("/signup")
async def signup(username: str, password: str):
    existing_user = await users_collection.find_one({"username": username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(password)
    await create_user({"username": username, "password": hashed_password})
    return {"status": "success", "message": "User created successfully"}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "username": user["username"]
    }

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await users_collection.find_one({"username": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ------------------ PROTECTED DATASET ENDPOINTS ------------------

@app.post("/analyze")
async def analyze_endpoint(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    session_id = str(uuid.uuid4())
    upload_path = os.path.join(TEMP_DIR, f"{session_id}.zip")
    extract_path = os.path.join(TEMP_DIR, session_id)

    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        with zipfile.ZipFile(upload_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

        analyzer = YOLOAnalyzer(extract_path)
        report = analyzer.analyze()

        # Save session to MongoDB with current_step track
        session_data = {
            "session_id": session_id,
            "user_id": str(current_user["_id"]),
            "report": report,
            "current_step": 1, 
            "strategy": None,
            "created_at": str(timedelta(seconds=0)) # Placeholder
        }
        await sessions_collection.insert_one(session_data)
        
        # Cache session and track as latest for user
        await cache.set_session(session_id, session_data)
        await cache.set_latest_session_key(str(current_user["_id"]), session_id)

        return {"status": "success", "session_id": session_id, "report": report}

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
    finally:
        if os.path.exists(upload_path): os.remove(upload_path)

@app.get("/sessions/latest")
async def get_latest_session(current_user: dict = Depends(get_current_user)):
    user_id_str = str(current_user["_id"])
    
    # 1. Check Redis for Latest Session ID
    session_id = await cache.get_latest_session_key(user_id_str)
    
    if session_id:
        # 2. Try to get full session from Cache
        session = await cache.get_session(session_id)
        if session:
            print("Cache Hit: Latest Session")
            return {"status": "success", "session": session}

    # 3. Fallback to MongoDB
    session_list = await sessions_collection.find({"user_id": user_id_str}).sort("_id", -1).limit(1).to_list(1)
    if not session_list:
        return {"status": "error", "message": "No sessions found"}
    
    session = session_list[0]
    session["_id"] = str(session["_id"])
    
    # 4. Re-populate Cache
    await cache.set_session(session["session_id"], session)
    await cache.set_latest_session_key(user_id_str, session["session_id"])
    
    print("Cache Miss: Populated Latest Session")
    return {"status": "success", "session": session}

@app.get("/sessions")
async def get_all_sessions(current_user: dict = Depends(get_current_user)):
    user_id_str = str(current_user["_id"])
    sessions = await sessions_collection.find({"user_id": user_id_str}).sort("_id", -1).to_list(100)
    
    # Process sessions for sidebar metadata
    sanitized_sessions = []
    for s in sessions:
        sanitized_sessions.append({
            "session_id": s["session_id"],
            "current_step": s.get("current_step", 1),
            "created_at": str(s.get("_id").generation_time),
            "classes": s.get("report", {}).get("classes", []),
            "image_count": s.get("report", {}).get("total_images", 0)
        })
    
    return {"status": "success", "sessions": sanitized_sessions}

@app.get("/sessions/{session_id}")
async def get_session_by_id(session_id: str, current_user: dict = Depends(get_current_user)):
    user_id_str = str(current_user["_id"])
    session = await sessions_collection.find_one({
        "session_id": session_id,
        "user_id": user_id_str
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session["_id"] = str(session["_id"])
    return {"status": "success", "session": session}

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    user_id_str = str(current_user["_id"])
    
    # 1. Verify ownership & delete from DB
    result = await sessions_collection.delete_one({
        "session_id": session_id,
        "user_id": user_id_str
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found or unauthorized")

    # 2. Invalidate Cache
    await cache.invalidate_session(session_id)
    await cache.invalidate_latest_session_key(user_id_str)
    
    # 3. Filesystem Cleanup
    paths_to_clean = [
        os.path.join(TEMP_DIR, f"{session_id}.zip"),
        os.path.join(TEMP_DIR, session_id),
        os.path.join(TEMP_DIR, f"{session_id}_fixed"),
        os.path.join(TEMP_DIR, f"{session_id}_export.zip"),
    ]
    
    for path in paths_to_clean:
        try:
            if os.path.exists(path):
                if os.path.isdir(path):
                    shutil.rmtree(path)
                else:
                    os.remove(path)
        except Exception as e:
            print(f"⚠️ Failed to clean path {path}: {str(e)}")

    return {"status": "success", "message": "Session and associated files purged successfully"}

@app.get("/optimize/{session_id}")
async def optimize_endpoint(session_id: str, current_user: dict = Depends(get_current_user)):
    # 1. Try Cache
    session = await cache.get_session(session_id)
    
    if not session:
        # 2. Try MongoDB
        session = await sessions_collection.find_one({
            "session_id": session_id,
            "user_id": str(current_user["_id"])
        })
    
    if not session:
        return {"status": "error", "message": "Session not found or unauthorized"}

    strategy = IntelligenceAgent.generate_strategy(session["report"])
    
    # Update local object
    session["strategy"] = strategy
    session["current_step"] = 3
    
    # 3. Update both DB and Cache
    await sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": {"strategy": strategy, "current_step": 4}} # Advance to final generation step
    )
    await cache.set_session(session_id, session)
    
    return {"status": "success", "strategy": strategy}

@app.patch("/sessions/{session_id}/step")
async def update_session_step(session_id: str, step: int, current_user: dict = Depends(get_current_user)):
    user_id_str = str(current_user["_id"])
    result = await sessions_collection.update_one(
        {"session_id": session_id, "user_id": user_id_str},
        {"$set": {"current_step": step}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Invalidate Cache to force refresh on next read
    await cache.invalidate_session(session_id)
    return {"status": "success", "step": step}

@app.post("/convert/{session_id}")
async def convert_dataset(session_id: str, include_test: bool = False, current_user: dict = Depends(get_current_user)):
    # 1. Invalidate Cache to ensure state refresh
    await cache.invalidate_session(session_id)
    
    # 2. Advance step to 2 (Repairing/Fixed)
    await sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": {"current_step": 2}}
    )

    session = await sessions_collection.find_one({
        "session_id": session_id,
        "user_id": str(current_user["_id"])
    })
    
    if not session:
        return {"status": "error", "message": "Session not found or unauthorized"}

    # Advance step to 2 (Repairing/Fixed)
    await sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": {"current_step": 2}}
    )

    class_names = session["report"].get("classes", [])
    source_path = os.path.join(TEMP_DIR, session_id)
    output_folder = os.path.join(TEMP_DIR, f"{session_id}_fixed")
    zip_base_name = os.path.join(TEMP_DIR, f"{session_id}_export")

    try:
        from standardizer import YOLOStandardizer
        standardizer = YOLOStandardizer(source_path, output_folder, class_names=class_names)
        standardizer.convert(include_test)
        shutil.make_archive(zip_base_name, 'zip', output_folder)

        return {"status": "success", "session_id": session_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/download/{session_id}")
async def download_file(session_id: str, current_user: dict = Depends(get_current_user)):
    # Verify ownership
    session = await sessions_collection.find_one({
        "session_id": session_id,
        "user_id": str(current_user["_id"])
    })
    if not session:
        raise HTTPException(status_code=403, detail="Unauthorized")

    file_path = os.path.join(TEMP_DIR, f"{session_id}_export.zip")
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename="yolo_expert_dataset.zip", media_type='application/zip')
    
    return {"status": "error", "message": "File not found"}

# ------------------ RECURSIVE FEEDBACK ------------------

@app.post("/feedback/{session_id}")
async def analyze_training_feedback(session_id: str, logs: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    session = await sessions_collection.find_one({"session_id": session_id, "user_id": str(current_user["_id"])})
    if not session: return {"status": "error", "message": "Unauthorized"}

    content = await logs.read()
    feedback = IntelligenceAgent.analyze_results(session["report"], content.decode(), prev_strategy=session.get("strategy"))
    
    updated_strategy = session.get("strategy", {})
    if feedback.get("suggested_changes") and updated_strategy:
        # Merge changes
        for k, v in feedback["suggested_changes"].items():
            if k in updated_strategy.get("train_params", {}):
                updated_strategy["train_params"][k] = v
            elif k in updated_strategy.get("aug_params", {}):
                updated_strategy["aug_params"][k] = v
            elif k in updated_strategy.get("val_params", {}):
                updated_strategy["val_params"][k] = v
            else:
                if "train_params" not in updated_strategy: updated_strategy["train_params"] = {}
                updated_strategy["train_params"][k] = v # Default
                
        # Merge context explanations
        if feedback.get("change_explanations"):
            if "explanations" not in updated_strategy: updated_strategy["explanations"] = {}
            updated_strategy["explanations"].update(feedback["change_explanations"])
            
        updated_strategy["reasoning"] = feedback.get("feedback", "Revised by Feedback")
        
        await sessions_collection.update_one(
            {"session_id": session_id},
            {"$set": {"strategy": updated_strategy}}
        )
        session["strategy"] = updated_strategy
        await cache.set_session(session_id, session)

    return {"status": "success", "feedback": feedback, "updated_strategy": updated_strategy}