import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../../001_provider/001_AppStateProvider";
import { fileSelector } from "@dannadori/voice-changer-client-js";

export const SFXArea = () => {
    const { reloadSfx, uploadSfxFile, setSfxGain, setSfxThreshold } = useAppState();
    const [files, setFiles] = useState<string[]>([]);
    const [threshold, setThreshold] = useState(-40);
    const [gain, setGain] = useState(1);

    const load = async () => {
        try {
            const res = await fetch("sfx/index.json");
            const arr = (await res.json()) as string[];
            setFiles(arr);
        } catch {
            setFiles([]);
        }
    };

    useEffect(() => { load(); }, []);

    const onReload = async () => {
        await reloadSfx();
        await load();
    };

    const onUpload = async () => {
        const f = await fileSelector("");
        if (!f) return;
        await uploadSfxFile(f, () => {});
        await onReload();
    };

    const list = useMemo(() => files.join(", "), [files]);

    return (
        <div className="config-sub-area">
            <div className="config-sub-area-control">
                <div className="config-sub-area-control-title">SFX</div>
                <div className="config-sub-area-control-field">
                    <div className="config-sub-area-buttons">
                        <div onClick={onReload} className="config-sub-area-button">Reload</div>
                        <div onClick={onUpload} className="config-sub-area-button">Upload</div>
                    </div>
                </div>
            </div>
            <div className="config-sub-area-control">
                <div className="config-sub-area-control-title">Threshold</div>
                <div className="config-sub-area-control-field">
                    <input className="config-sub-area-slider-control-slider" type="range" min="-80" max="0" step="1" value={threshold} onChange={(e)=>{ const v=Number(e.target.value); setThreshold(v); setSfxThreshold(v); }} />
                    <span className="config-sub-area-slider-control-val">{threshold} dB</span>
                </div>
            </div>
            <div className="config-sub-area-control">
                <div className="config-sub-area-control-title">Gain</div>
                <div className="config-sub-area-control-field">
                    <input className="config-sub-area-slider-control-slider" type="range" min="0" max="2" step="0.1" value={gain} onChange={(e)=>{ const v=Number(e.target.value); setGain(v); setSfxGain(v); }} />
                    <span className="config-sub-area-slider-control-val">{gain}</span>
                </div>
            </div>
            <div className="config-sub-area-control">
                <div className="config-sub-area-control-title">Files</div>
                <div className="config-sub-area-control-field">{list}</div>
            </div>
        </div>
    );
};
