import os
import logging
from typing import List
from fastapi import APIRouter, UploadFile, Form
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from restapi.mods.FileUploader import upload_file
from const import SFX_DIR

logger = logging.getLogger(__name__)

class MMVC_Rest_SFX:
    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route("/sfx_list", self.get_sfx_list, methods=["GET"])
        self.router.add_api_route("/upload_sfx", self.post_upload_sfx, methods=["POST"])

    def get_sfx_list(self):
        try:
            files = [f for f in os.listdir(SFX_DIR) if f.lower().endswith(".wav")]
            return JSONResponse(content=jsonable_encoder(files))
        except Exception as e:
            logger.exception(e)
            return JSONResponse(status_code=500, content={"error": str(e)})

    def post_upload_sfx(self, file: UploadFile, filename: str = Form(...)):
        try:
            res = upload_file(SFX_DIR, file, filename)
            return JSONResponse(content=jsonable_encoder(res))
        except Exception as e:
            logger.exception(e)
            return JSONResponse(status_code=500, content={"error": str(e)})
