import os
from const import EnumInferenceTypes
from dataclasses import asdict
import torch
import json
import safetensors

from data.ModelSlot import RVCModelSlot
from voice_changer.common.SafetensorsUtils import convert_single
from voice_changer.utils.LoadModelParams import LoadModelParams
from voice_changer.utils.ModelSlotGenerator import ModelSlotGenerator
from settings import get_settings
import logging
logger = logging.getLogger(__name__)

class RVCModelSlotGenerator(ModelSlotGenerator):
    @classmethod
    def load_model(cls, props: LoadModelParams):
        model_dir = get_settings().model_dir

        slotInfo: RVCModelSlot = RVCModelSlot()
        for file in props.files:
            if file.kind == "rvcModel":
                slotInfo.modelFile = file.name
            elif file.kind == "rvcIndex":
                slotInfo.indexFile = file.name
        slotInfo.defaultTune = 0
        slotInfo.defaultFormantShift = 0
        slotInfo.defaultIndexRatio = 0
        slotInfo.defaultProtect = 0.5
        slotInfo.name = os.path.splitext(os.path.basename(slotInfo.modelFile))[0]
        logger.info(f"RVC:: slotInfo.modelFile {slotInfo.modelFile}")

        modelPath = os.path.join(model_dir, str(props.slot), os.path.basename(slotInfo.modelFile))
        slotInfo = cls._setInfoByPytorch(modelPath, slotInfo)
            if not modelPath.endswith(".safetensors"):
                convert_single(modelPath, True)
                filename, _ = os.path.splitext(os.path.basename(modelPath))
                slotInfo.modelFile = f'{filename}.safetensors'
        return slotInfo

    @classmethod
    def _setInfoByPytorch(cls, modelPath: str, slot: RVCModelSlot):
        if modelPath.endswith(".safetensors"):
            with safetensors.safe_open(modelPath, 'pt') as data:
                cpt = data.metadata()
                cpt['f0'] = int(cpt['f0'])
                cpt['config'] = json.loads(cpt['config'])
        else:
            cpt = torch.load(modelPath, map_location="cpu")
        config_len = len(cpt["config"])
        version = cpt.get("version", "v1")

        slot = RVCModelSlot(**asdict(slot))
        slot.f0 = True if cpt["f0"] == 1 else False

        if config_len == 18:
            # Original RVC
            if version == "v1":
                slot.modelType = EnumInferenceTypes.pyTorchRVC.value if slot.f0 else EnumInferenceTypes.pyTorchRVCNono.value
                slot.embChannels = 256
                slot.embOutputLayer = 9
                slot.useFinalProj = True
                slot.embedder = "hubert_base"
                logger.info("Official Model(pyTorch) : v1")
            else:
                slot.modelType = EnumInferenceTypes.pyTorchRVCv2.value if slot.f0 else EnumInferenceTypes.pyTorchRVCv2Nono.value
                slot.embChannels = 768
                slot.embOutputLayer = 12
                slot.useFinalProj = False
                slot.embedder = "hubert_base"
                logger.info("Official Model(pyTorch) : v2")

        else:
            # DDPN RVC
            slot.f0 = True if cpt["f0"] == 1 else False
            slot.modelType = EnumInferenceTypes.pyTorchWebUI.value if slot.f0 else EnumInferenceTypes.pyTorchWebUINono.value
            slot.embChannels = cpt["config"][17]
            slot.embOutputLayer = cpt["embedder_output_layer"] if "embedder_output_layer" in cpt else 9
            if slot.embChannels == 256:
                slot.useFinalProj = True
            else:
                slot.useFinalProj = False

            # DDPNモデルの情報を表示
            if slot.embChannels == 256 and slot.embOutputLayer == 9 and slot.useFinalProj:
                logger.info("DDPN Model(pyTorch) : Official v1 like")
            elif slot.embChannels == 768 and slot.embOutputLayer == 12 and slot.useFinalProj is False:
                logger.info("DDPN Model(pyTorch): Official v2 like")
            else:
                logger.info(f"DDPN Model(pyTorch): ch:{slot.embChannels}, L:{slot.embOutputLayer}, FP:{slot.useFinalProj}")

            slot.embedder = cpt["embedder_name"]
            if slot.embedder.endswith("768"):
                slot.embedder = slot.embedder[:-3]

            if "speaker_info" in cpt.keys():
                for k, v in cpt["speaker_info"].items():
                    slot.speakers[int(k)] = str(v)

        slot.samplingRate = cpt["config"][-1]

        del cpt

        return slot

    @classmethod
