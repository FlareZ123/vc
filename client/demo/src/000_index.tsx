import * as React from "react";
import { createRoot } from "react-dom/client";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { ErrorInfo, useEffect, useMemo, useState } from "react";

import "./css/App.css";
import ErrorBoundary from "./001_provider/900_ErrorBoundary";
import { AppStateProvider } from "./001_provider/001_AppStateProvider";
import { AppRootProvider, useAppRoot } from "./001_provider/001_AppRootProvider";
import { useIndexedDB } from "@dannadori/voice-changer-client-js";
import { Demo } from "./components/demo/010_Demo";
import { useMessageBuilder } from "./hooks/useMessageBuilder";

library.add(fas, far, fab);

/**
 * Bootstrap the React application by mounting it onto the DOM.
 *
 * @param elementId - ID of the root DOM element.
 */
export const bootstrap = (elementId = "app"): void => {
    const start = (): void => {
        const container = document.getElementById(elementId);
        if (!container) {
            console.error(`Failed to find element with id ${elementId}`);
            return;
        }
        // Reuse the same React root if it already exists to prevent
        // double initialization which can lead to "U.current is null" errors
        const existingRoot = (container as any).__reactRoot as ReturnType<typeof createRoot> | undefined;
        const root = existingRoot ?? createRoot(container);
        (container as any).__reactRoot = root;
        root.render(
            <AppRootProvider>
                <AppStateWrapper></AppStateWrapper>
            </AppRootProvider>,
        );
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
};

const App = () => {
    const { appGuiSettingState } = useAppRoot();
    const front = useMemo(() => {
        if (appGuiSettingState.appGuiSetting.type == "demo") {
            return <Demo></Demo>;
        } else {
            return <>unknown gui type. {appGuiSettingState.appGuiSetting.type}</>;
        }
    }, [appGuiSettingState.appGuiSetting.type]);

    return <>{front}</>;
};

const AppStateWrapper = () => {
    const { appGuiSettingState, getGUISetting } = useAppRoot();
    const messageBuilderState = useMessageBuilder();
    // エラーメッセージ登録
    useMemo(() => {
        messageBuilderState.setMessage(__filename, "Problem", { ja: "ちょっと問題が起きたみたいです。", en: "Looks like there's a bit of a problem." });
        messageBuilderState.setMessage(__filename, "Problem-sub1", { ja: "このアプリで管理している情報をクリアすると回復する場合があります。", en: "" });
        messageBuilderState.setMessage(__filename, "Problem-sub2", { ja: "下記のボタンを押して情報をクリアします。", en: "If you clear the information being managed by this app, it may be recoverable." });
        messageBuilderState.setMessage(__filename, "Problem-action1", { ja: "アプリを初期化", en: "Initialize" });
        messageBuilderState.setMessage(__filename, "Problem-action2", { ja: "初期化せずリロード", en: "Reload without initialize" });
    }, []);

    // エラーバウンダリー設定
    const [error, setError] = useState<{ error: Error; errorInfo: ErrorInfo | null; reason: any }>();
    const { removeDB } = useIndexedDB({ clientType: null });

    const errorComponent = useMemo(() => {
        const errorName = error?.error.name || "no error name";
        const errorMessage = error?.error.message || "no error message";
        const errorInfos = (error?.errorInfo?.componentStack || "no error stack").split("\n");
        const reasonMessage = (error?.reason || "no reason").toString();
        const reasonStack = (error?.reason.stack || "no stack").split("\n") as string[];

        const onClearCacheClicked = async () => {
            await removeDB();
            location.reload();
        };
        const onReloadClicked = () => {
            location.reload();
        };
        return (
            <div className="error-container">
                <div className="top-error-message">{messageBuilderState.getMessage(__filename, "Problem")}</div>
                <div className="top-error-description">
                    <p> {messageBuilderState.getMessage(__filename, "Problem-sub1")}</p>
                    <p> {messageBuilderState.getMessage(__filename, "Problem-sub2")}</p>
                    <p>
                        <button onClick={onClearCacheClicked}>{messageBuilderState.getMessage(__filename, "Problem-action1")}</button>
                    </p>
                    <p>
                        <button onClick={onReloadClicked}>{messageBuilderState.getMessage(__filename, "Problem-action2")}</button>
                    </p>
                </div>
                <div className="error-detail">
                    <div className="error-name">{errorName}</div>
                    <div className="error-message">{errorMessage}</div>
                    <div className="error-info-container">
                        {errorInfos.map((x) => {
                            return (
                                <div className="error-info-line" key={x}>
                                    {x}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="error-detail">
                    <div className="error-name">{reasonMessage}</div>
                    <div className="error-message"></div>
                    <div className="error-info-container">
                        {reasonStack.map((x) => {
                            return (
                                <div className="error-info-line" key={x}>
                                    {x}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }, [error]);

    const updateError = (error: Error, errorInfo: React.ErrorInfo | null, reason: any) => {
        setError({ error, errorInfo, reason });
    };

    useEffect(() => {
        const loadDefaultModelType = async () => {
            getGUISetting();
        };
        loadDefaultModelType();
    }, []);

    if (!appGuiSettingState.guiSettingLoaded) {
        return <>loading...</>;
    } else {
        return (
            <ErrorBoundary fallback={errorComponent} onError={updateError}>
                <AppStateProvider>
                    <App></App>
                </AppStateProvider>
            </ErrorBoundary>
        );
    }
};

bootstrap();