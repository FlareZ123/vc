import React, { useMemo } from "react";
import { useAppState } from "../../../001_provider/001_AppStateProvider";

export const SfxArea = () => {
    const { serverSetting } = useAppState();

    const row = useMemo(() => {
        const onToggle = async () => {
            await serverSetting.updateServerSettings({
                ...serverSetting.serverSetting,
                sfxEnabled: serverSetting.serverSetting.sfxEnabled ? 0 : 1,
            });
        };
        const onRefresh = async () => {
            await serverSetting.reloadSfx();
        };
        const toggleClass = serverSetting.serverSetting.sfxEnabled
            ? "config-sub-area-button-active"
            : "config-sub-area-button";
        return (
            <>
                <div className="config-sub-area-control">
                    <div className="config-sub-area-control-title-long">Background SFX</div>
                </div>
                <div className="config-sub-area-control left-padding-1">
                    <div className="config-sub-area-control-title">status</div>
                    <div className="config-sub-area-control-field">
                        <div className="config-sub-area-buttons">
                            <div onClick={onToggle} className={toggleClass}>
                                {serverSetting.serverSetting.sfxEnabled ? "on" : "off"}
                            </div>
                            <div onClick={onRefresh} className="config-sub-area-button">
                                refresh
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }, [serverSetting.serverSetting.sfxEnabled, serverSetting.updateServerSettings, serverSetting.reloadSfx]);

    return <div className="config-sub-area">{row}</div>;
};
