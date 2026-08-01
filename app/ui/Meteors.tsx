import { css } from "remix/ui";
const maxDelay = 30;

export function Meteors() {
  const meteorMix = css({
    width: "100vw",
    height: "100vh",
    position: "absolute",
    transformOrigin: "top left",
    transform: `translate(var(--meteor-x, 40%), var(--meteor-y, 60%))
      rotate(-45deg)`,
    animation: "meteor 30s var(--meteor-delay, 0s) infinite linear",
    opacity: 0,
    "&:before": {
      content: "''",
      background:
        "linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3) 15%, rgba(255, 255, 255, 0))",
      height: "0.5rem",
      width: "200px",
      borderRadius: "900px 100% 100% 900px",
      position: "absolute",
      clipPath: "polygon(0 0, 100% 50%, 0 100%)",
    },
    "&:after": {
      content: "''",
      position: "absolute",
      top: "0",
      height: "0.5rem",
      width: "0.5rem",
      borderRadius: "100%",
      background: "linear-gradient(40deg, rgba(255, 255, 255, 1), rgba(128, 128, 128, 0))",
    },
  });
  const meteors = Array.from({ length: 14 }).map(() => (
    <div
      class="meteor"
      mix={[
        meteorMix,
        css({
          "--meteor-x": `${Math.round(Math.random() * 100)}%`,
          "--meteor-y": `${Math.round(Math.random() * 100)}%`,
          "--meteor-delay": `${Math.round(Math.random() * maxDelay)}s`,
        }),
      ]}
    />
  ));

  return () => (
    <>
      <style>{`@keyframes meteor {
  0% {
    opacity: 0;
    transform: translate(var(--meteor-x, 40%), var(--meteor-y, 60%))
      rotate(-45deg);
  }

  1% {
    opacity: 1;
  }
  3% {
    opacity: 1;
  }
  4% {
    opacity: 0;
    transform: translate(
        calc(var(--meteor-x, 40%) - 300px),
        calc(var(--meteor-y, 60%) + 300px)
      )
      rotate(-45deg);
  }
  100% {
    opacity: 0;
    transform: translate(
        calc(var(--meteor-x, 40%) - 300px),
        calc(var(--meteor-y, 60%) + 300px)
      )
      rotate(-45deg);
  }
}
`}</style>
      <div
        className="meteors"
        mix={css({
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
        })}
      >
        {meteors}
      </div>
    </>
  );
}
