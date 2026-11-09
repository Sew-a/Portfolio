import { useRemoteComponent } from "@/src/hooks/useRemoteComponent";
import { CANVAS_MINIAPP, REMOTE_MODULE } from "@/src/pages/demos/constants";

export default function CanvasMiniapp() {
  const { containerRef, status, error } = useRemoteComponent(REMOTE_MODULE);

  return (
    <div className="canvas-miniapp">
      <div className="canvas-miniapp__bar">
        <span className="canvas-miniapp__window-dot canvas-miniapp__window-dot--red" />
        <span className="canvas-miniapp__window-dot canvas-miniapp__window-dot--yellow" />
        <span className="canvas-miniapp__window-dot canvas-miniapp__window-dot--green" />
        <span className="canvas-miniapp__title">{CANVAS_MINIAPP.barTitle}</span>
      </div>

      {status === "loading" && (
        <div className="canvas-miniapp__status">
          <div className="canvas-miniapp__spinner" />
          <span>{CANVAS_MINIAPP.loading}</span>
        </div>
      )}

      {status === "error" && (
        <div className="canvas-miniapp__error">
          <p className="canvas-miniapp__error-title">
            {CANVAS_MINIAPP.errorTitle}
          </p>
          <p className="canvas-miniapp__error-msg">{error}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="canvas-miniapp__body"
        style={{ display: status === "loaded" ? "block" : "none" }}
      />
    </div>
  );
}