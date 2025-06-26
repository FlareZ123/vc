import os
import logging
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from restapi.mods.FileUploader import upload_file
from const import SFX_DIR

logger = logging.getLogger(__name__)


class MMVC_Rest_SoundEffects:
    """REST API for background sound effects."""

    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route("/sfx/list", self.get_list, methods=["GET"])
        self.router.add_api_route("/sfx/upload", self.post_upload, methods=["POST"])

    def get_list(self):
        """Return a list of available wav files."""
        try:
            files = [f for f in os.listdir(SFX_DIR) if f.lower().endswith(".wav")]
            return {"files": files}
        except Exception as e:  # pragma: no cover - simple forwarding
            logger.exception(e)
            return {"files": []}

    def post_upload(self, file: UploadFile, filename: str = Form(...)):
        """Upload a wav file to the SFX directory."""
        try:
            res = upload_file(SFX_DIR, file, filename)
            data = jsonable_encoder(res)
            return JSONResponse(content=data)
        except Exception as e:  # pragma: no cover - simple forwarding
            logger.exception(e)
            raise
