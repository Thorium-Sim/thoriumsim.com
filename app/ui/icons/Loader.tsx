import { css, type Handle, type Props } from "remix/ui";

export function Loader(handle: Handle<Props<"svg">>) {
  return () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      {...handle.props}
      mix={[
        css({
          animation: "loader-spin 700ms steps(8) infinite",
          "@keyframes loader-spin": {
            from: {
              transform: "rotate(0deg)",
            },
            to: {
              transform: "rotate(360deg)",
            },
          },
        }),
        handle.props.mix,
      ]}
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" opacity={0.125} />
      <path d="M18 12h4" opacity={0.25} />
      <path d="m16.2 16.2 2.9 2.9" opacity={0.375} />
      <path d="M12 18v4" opacity={0.5} />
      <path d="m4.9 19.1 2.9-2.9" opacity={0.625} />
      <path d="M2 12h4" opacity={0.75} />
      <path d="m4.9 4.9 2.9 2.9" opacity={0.875} />
    </svg>
  );
}
