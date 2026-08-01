import { type Handle, type RemixNode, css } from "remix/ui";
export function Stars(handle: Handle<{ children?: RemixNode }>) {
  const shadowsSmall = Array.from({ length: 700 })
    .map(() => `${Math.round(Math.random() * 2000)}px ${Math.round(Math.random() * 2000)}px #fff`)
    .join(", ");
  const shadowsMedium = Array.from({ length: 200 })
    .map(() => `${Math.round(Math.random() * 2000)}px ${Math.round(Math.random() * 2000)}px #fff`)
    .join(", ");
  const shadowsBig = Array.from({ length: 100 })
    .map(() => `${Math.round(Math.random() * 2000)}px ${Math.round(Math.random() * 2000)}px #fff`)
    .join(", ");

  return () => {
    let { children } = handle.props;
    return (
      <div
        mix={css({
          position: "relative",
          height: "100vh",
          width: "100vw",
          flex: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        <style>
          {`@keyframes animStar {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-2000px);
  }
}`}
        </style>
        <div
          mix={css({
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            overflow: "hidden",
            width: "100vw",
            height: "100vh",
          })}
        >
          <div
            mix={css({
              width: "1px",
              height: "1px",
              background: "transparent",
              boxShadow: shadowsSmall,
              animation: "animStar 50s linear infinite",
              "&:after": {
                content: "''",
                position: "absolute",
                top: "2000px",
                width: "1px",
                height: "1px",
                background: "transparent",
                boxShadow: shadowsSmall,
              },
            })}
          />
          <div
            mix={css({
              width: "2px",
              height: "2px",
              background: "transparent",
              boxShadow: shadowsMedium,
              animation: "animStar 100s linear infinite",
              "&:after": {
                content: "''",
                position: "absolute",
                top: "2000px",
                width: "2px",
                height: "2px",
                background: "transparent",
                boxShadow: shadowsMedium,
              },
            })}
          />
          <div
            mix={css({
              width: "3px",
              height: "3px",
              background: "transparent",
              boxShadow: shadowsBig,
              animation: "animStar 150s linear infinite",
              "&:after": {
                content: "''",
                position: "absolute",
                top: "2000px",
                width: "3px",
                height: "3px",
                background: "transparent",
                boxShadow: shadowsBig,
              },
            })}
          />
        </div>
        {children}
      </div>
    );
  };
}
