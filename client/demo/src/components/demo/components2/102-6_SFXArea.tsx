import React, { useMemo } from "react";
import { useAppState } from "../../../001_provider/001_AppStateProvider";

export const SFXArea = () => {
    const { enableSfx, setSfxVolume, loadSfxFiles, setting } = useAppState();

    const row = useMemo(() => {
        return (
            <div className="config-sub-area">
                <div className="config-sub-area-control">
                    <div className="config-sub-area-control-title">SFX</div>
                    <div className="config-sub-area-control-field">
                        <input
                            type="checkbox"
                            checked={setting.voiceChangerClientSetting.sfxEnabled}
                            onChange={(e) => enableSfx(e.target.checked)}
                        />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={setting.voiceChangerClientSetting.sfxVolume}
                            onChange={(e) => setSfxVolume(Number(e.target.value))}
                        />
                        <input
                            type="file"
                            webkitdirectory="true"
                            multiple
                            accept=".wav"
                            onChange={(e) => {
                                if (e.target.files) {
                                    loadSfxFiles(e.target.files);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }, [enableSfx, setSfxVolume, loadSfxFiles, setting.voiceChangerClientSetting]);

    return row;
};
