from fastapi import FastAPI, File, UploadFile
from deepface import DeepFace
import shutil
import uuid
import os
import tempfile
app = FastAPI()

model_name = "Facenet"
model = DeepFace.build_model(model_name)

@app.post("/api/verify_face_match")
async def verify_face_match(img1: UploadFile = File(...), img2: UploadFile = File(...)):
    try:
        tmp_dir = tempfile.gettempdir()
        tmp1 = os.path.join(tmp_dir, f"{uuid.uuid4()}.jpg")
        tmp2 = os.path.join(tmp_dir, f"{uuid.uuid4()}.jpg")


        with open(tmp1, "wb") as f1:
            shutil.copyfileobj(img1.file, f1)
        with open(tmp2, "wb") as f2:
            shutil.copyfileobj(img2.file, f2)

        result = DeepFace.verify(
            tmp1,
            tmp2,
            model_name=model_name,
            enforce_detection=False
        )
        os.remove(tmp1)
        os.remove(tmp2)
        return result

    except Exception as e:
        return {"error": str(e)}
