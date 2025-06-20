import os
import librosa
import numpy as np
import logging
from voice_changer.VoiceChangerSettings import VoiceChangerSettings

logger = logging.getLogger(__name__)

class SFXPlayer:
    """Simple background SFX loop player."""

    def __init__(self, settings: VoiceChangerSettings) -> None:
        self.settings = settings
        self.sfx_data: list[np.ndarray] = []
        self.positions: list[int] = []
        self.reload()

    def reload(self) -> None:
        """Load all .wav files from the configured directory."""
        self.sfx_data.clear()
        self.positions.clear()
        dir_path = self.settings.sfxDir
        if not os.path.isdir(dir_path):
            logger.warning(f"SFX directory does not exist: {dir_path}")
            return
        for file in os.listdir(dir_path):
            if not file.lower().endswith('.wav'):
                continue
            path = os.path.join(dir_path, file)
            try:
                wav, _ = librosa.load(path, sr=self.settings.outputSampleRate, mono=True)
                self.sfx_data.append(wav.astype(np.float32))
                self.positions.append(0)
                logger.info(f"Loaded SFX file: {file}")
            except Exception as e:
                logger.exception(e)

    def mix(self, audio: np.ndarray) -> np.ndarray:
        """Mix loaded SFX with provided audio."""
        if not self.settings.sfxEnabled or not self.sfx_data:
            return audio
        block_len = len(audio)
        out = audio.copy()
        for i, wav in enumerate(self.sfx_data):
            pos = self.positions[i]
            if pos + block_len <= len(wav):
                chunk = wav[pos:pos + block_len]
                self.positions[i] = pos + block_len
            else:
                remain = len(wav) - pos
                chunk = np.concatenate([wav[pos:], wav[:block_len - remain]])
                self.positions[i] = (block_len - remain) % len(wav)
            out = np.clip(out + chunk, -1.0, 1.0)
        return out
