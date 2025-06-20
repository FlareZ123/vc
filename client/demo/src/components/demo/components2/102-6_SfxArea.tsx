import React, { useMemo } from "react";
import { useAppState } from "../../../001_provider/001_AppStateProvider";
import { useGuiState } from "../001_GuiStateProvider";

/**
 * UI control for ambient SFX playback.
 * Allows selecting a server directory containing WAV files and toggling
 * background playback. Files are reloaded when the refresh button is pressed.
 */

export const SfxArea = () => {
    const { setting, setVoiceChangerClientSetting, refreshSfx } = useAppState();
    const guiState = useGuiState();

    const area = useMemo(() => {
        return (
            <div className="config-sub-area">
                <div className="config-sub-area-control">
                    <div className="config-sub-area-control-title">SFX Dir</div>
                    <div className="config-sub-area-control-field">
                        <input
                            className="body-input"
                            type="text"
                            value={setting.voiceChangerClientSetting.sfxDirectory}
                            onChange={e => setVoiceChangerClientSetting({ ...setting.voiceChangerClientSetting, sfxDirectory: e.target.value })}
                        />
                    </div>
                </div>
                <div className="config-sub-area-control left-padding-1">
                    <div className="config-sub-area-control-title">SFX</div>
                    <div className="config-sub-area-control-field">
                        <input
                            type="checkbox"
                            checked={setting.voiceChangerClientSetting.sfxEnabled}
                            onChange={e => setVoiceChangerClientSetting({ ...setting.voiceChangerClientSetting, sfxEnabled: e.target.checked })}
                            disabled={guiState.isConverting}
                        />
                        <button className="config-sub-area-button" onClick={refreshSfx}>refresh</button>
                    </div>
                </div>
            </div>
        );
    }, [setting.voiceChangerClientSetting, guiState.isConverting, refreshSfx]);

    return area;
};
