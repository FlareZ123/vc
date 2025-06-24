import torch
from voice_changer.embedder.DummyEmbedder import DummyEmbedder

def test_dummy_embedder_extract_features():
    emb = DummyEmbedder().load_model('dummy')
    x = torch.zeros(1, 80)
    feat = emb.extract_features(x)
    assert feat.shape[0] == 1
