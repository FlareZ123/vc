"""Sound effect listing REST API."""

import os
import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from const import SFX_DIR

logger = logging.getLogger(__name__)

class MMVC_Rest_Sfx:
    """REST API router for background sound effects."""

    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route("/sfx/list", self.get_sfx_list, methods=["GET"])

    def get_sfx_list(self, dir: str = ""):
        """Return list of wav files in the given directory."""
        target_dir = os.path.join(SFX_DIR, dir)
        try:
            files = []
            if os.path.isdir(target_dir):
                for f in os.listdir(target_dir):
                    path = os.path.join(target_dir, f)
                    if os.path.isfile(path) and f.lower().endswith(".wav"):
                        files.append(f)
            return JSONResponse(content={"status": "OK", "files": files})
        except Exception as e:
            logger.exception(e)
            return JSONResponse(content={"status": "NG", "files": []})
