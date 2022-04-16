import * as React from "react";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      as: Component = "input",
      children,
      ...props
    }: React.InputHTMLAttributes<HTMLInputElement> &
      React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        as?: React.ElementType<any>;
        label: string;
        error?: string;
        children?: React.ReactNode;
      },
    ref
  ) => {
    return (
      <div className="mb-2">
        <label className="text-grey-200 block text-sm font-bold">
          {label}
          {children ? (
            children
          ) : (
            <Component
              ref={ref}
              className={`text-grey-200 my-2 w-full appearance-none rounded border border-opacity-50 bg-black bg-opacity-50 py-2 px-3 shadow  ring-thorium-400 focus:outline-none focus:ring ${
                error ? "border-red-500" : ""
              }`}
              type="text"
              {...props}
            />
          )}
        </label>
        <p className="text-xs italic text-red-500">{error ? error : null}</p>
      </div>
    );
  }
);

Input.displayName = "Input";
