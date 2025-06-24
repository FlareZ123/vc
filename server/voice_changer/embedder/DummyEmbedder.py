import torch
from voice_changer.embedder.Embedder import Embedder

class DummyEmbedder(Embedder):
    """A placeholder embedder used when ONNX is not available."""
    def load_model(self, file: str):
        self.set_props("hubert_base", file)
        self.model = None
        return self

    def extract_features(self, feats: torch.Tensor, embOutputLayer=9, useFinalProj=True) -> torch.Tensor:
        return torch.zeros((feats.shape[0], 256, feats.shape[1] // 2), device=feats.device)

