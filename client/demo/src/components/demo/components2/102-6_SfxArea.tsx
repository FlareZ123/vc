import React, { useMemo, useState } from "react";
import { useAppState } from "../../../001_provider/001_AppStateProvider";

export const SfxArea = () => {
    const { setVoiceChangerClientSetting, setting, clientState } = useAppState();
    const [files, setFiles] = useState<string[]>([]);

    const reload = async () => {
        const list = await clientState.listSfx();
        if (list) {
            setFiles(list.files);
        }
        await clientState.reloadSfx();
    };

    const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await clientState.uploadSfx(file);
        await reload();
    };

    return useMemo(() => {
        return (
            <div className="config-sub-area">
                <div className="config-sub-area-control">
                    <div className="config-sub-area-control-title">SFX Gain</div>
                    <div className="config-sub-area-control-field">
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={setting.voiceChangerClientSetting.sfxGain}
                            onChange={(e) => {
                                setVoiceChangerClientSetting({
                                    ...setting.voiceChangerClientSetting,
                                    sfxGain: Number(e.target.value),
                                });
                            }}
                        />
                        <span className="config-sub-area-slider-control-val">
                            {setting.voiceChangerClientSetting.sfxGain.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="config-sub-area-control">
                    <div className="config-sub-area-control-title">Threshold</div>
                    <div className="config-sub-area-control-field">
                        <input
                            type="range"
                            min={0.001}
                            max={0.1}
                            step={0.001}
                            value={setting.voiceChangerClientSetting.sfxStartThreshold}
                            onChange={(e) => {
                                setVoiceChangerClientSetting({
                                    ...setting.voiceChangerClientSetting,
                                    sfxStartThreshold: Number(e.target.value),
                                });
                            }}
                        />
                        <span className="config-sub-area-slider-control-val">
                            {setting.voiceChangerClientSetting.sfxStartThreshold.toFixed(3)}
                        </span>
                    </div>
                </div>
                <div className="config-sub-area-control">
                    <div className="config-sub-area-control-title">Files</div>
                    <div className="config-sub-area-control-field">
                        <button onClick={reload}>reload</button>
                        <input type="file" accept="audio/wav" onChange={upload} />
                        <div>{files.join(", ")}</div>
                    </div>
                </div>
            </div>
        );
    }, [files, setting.voiceChangerClientSetting]);
};
