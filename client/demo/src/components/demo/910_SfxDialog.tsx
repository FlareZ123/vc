import React, { useMemo, useState } from "react";
import { useGuiState } from "./001_GuiStateProvider";
import { useAppState } from "../../001_provider/001_AppStateProvider";

/**
 * Dialog for configuring looping background sound effects.
 */
export const SfxDialog = () => {
    const guiState = useGuiState();
    const { serverSetting } = useAppState();
    const [dir, setDir] = useState<string>(serverSetting.serverSetting.sfxDir);

    const dialog = useMemo(() => {
        const onEnableChanged = async (val: boolean) => {
            await serverSetting.updateServerSettings({
                ...serverSetting.serverSetting,
                sfxEnabled: val ? 1 : 0,
            });
        };
        const onRefreshClicked = async () => {
            await serverSetting.updateServerSettings({
                ...serverSetting.serverSetting,
                sfxDir: dir,
            });
        };
        const closeButtonRow = (
            <div className="body-row split-3-4-3 left-padding-1">
                <div className="body-item-text"></div>
                <div className="body-button-container body-button-container-space-around">
                    <div
                        className="body-button"
                        onClick={() => {
                            guiState.stateControls.showSfxDialogCheckbox.updateState(false);
                        }}
                    >
                        close
                    </div>
                </div>
                <div className="body-item-text"></div>
            </div>
        );
        const enableRow = (
            <div className="advanced-setting-container-row">
                <div className="advanced-setting-container-row-title">Enable</div>
                <div className="advanced-setting-container-row-field">
                    <input
                        type="checkbox"
                        checked={Boolean(serverSetting.serverSetting.sfxEnabled)}
                        onChange={(e) => onEnableChanged(e.target.checked)}
                    />
                </div>
            </div>
        );
        const dirRow = (
            <div className="advanced-setting-container-row">
                <div className="advanced-setting-container-row-title">Folder</div>
                <div className="advanced-setting-container-row-field">
                    <input
                        type="text"
                        value={dir}
                        onChange={(e) => setDir(e.target.value)}
                    />
                    <div className="body-button" onClick={onRefreshClicked}>
                        refresh
                    </div>
                </div>
            </div>
        );
        const filesRow = (
            <div className="advanced-setting-container-row">
                <div className="advanced-setting-container-row-title">Files</div>
                <div className="advanced-setting-container-row-field">
                    {serverSetting.serverSetting.sfxFiles.join(", ")}
                </div>
            </div>
        );
        const content = (
            <div className="advanced-setting-container">
                {enableRow}
                {dirRow}
                {filesRow}
            </div>
        );
        return (
            <div className="dialog-frame">
                <div className="dialog-title">SFX Setting</div>
                <div className="dialog-content">
                    {content}
                    {closeButtonRow}
                </div>
            </div>
        );
    }, [dir, serverSetting.serverSetting]);
    return dialog;
};
