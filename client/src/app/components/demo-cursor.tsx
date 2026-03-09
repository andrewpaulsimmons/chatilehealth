/**
 * DemoCursor — a virtual mouse pointer rendered during the auto-demo.
 *
 * Always mounts in the DOM but starts invisible (opacity 0).
 * The demo orchestrator in chat-nav-bar.tsx positions and animates
 * it via direct DOM manipulation on #demo-cursor / #demo-cursor-ripple.
 */
export function DemoCursor() {
  return (
    <div
      id="demo-cursor"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 28,
        height: 28,
        pointerEvents: "none",
        zIndex: 99999,
        opacity: 0,
        transform: "scale(1)",
        transition:
          "left 0.45s cubic-bezier(0.22, 1, 0.36, 1), top 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease, transform 0.15s ease",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.28))",
      }}
    >
      {/* Click ripple — expands behind the pointer tip on click */}
      <div
        id="demo-cursor-ripple"
        style={{
          position: "absolute",
          top: -6,
          left: -6,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.25)",
          transform: "scale(0)",
          opacity: 0,
          transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease",
        }}
      />

      {/* Classic pointer arrow */}
      <svg
        width="20"
        height="26"
        viewBox="0 0 20 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1L1 20.5L5.5 16L9.5 24.5L13 23L9 14.5L15 14.5L1 1Z"
          fill="#111827"
          stroke="white"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
