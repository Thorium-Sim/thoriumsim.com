export function Button({
  className = "bg-thorium-500 hover:bg-thorium-600 disabled:bg-tgray-200",
  ...props
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  return (
    <button
      {...props}
      className={`${className} text-white  disabled:cursor-not-allowed font-bold py-2 px-4 rounded`}
    ></button>
  );
}
