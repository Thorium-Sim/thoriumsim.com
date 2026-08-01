import { css, on, type Handle, type Props } from "remix/ui";

export function FallbackImage(handle: Handle<Props<"img">>) {
  let failed = false;
  return () => {
    const props = handle.props;
    return props.src && !failed ? (
      <img
        src={props.src}
        mix={[
          imageStyle,
          on("error", () => {
            failed = true;
            handle.update();
          }),
          props.mix,
        ]}
      />
    ) : (
      <div mix={[imageStyle, css({ background: "oklch(0.2584 0.1716 311)" }), props.mix as any]} />
    );
  };
}
const imageStyle = css({
  height: "2rem",
  width: "2rem",
  borderRadius: "0.5rem",
  border: "solid 1px rgb(255 255 255 / 0.2)",
  background: "black",
});
