import * as React from "react";

export function Input({
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
  }) {
  return (
    <div className="mb-2">
      <label className="block text-grey-200 text-sm font-bold">
        {label}
        {children ? (
          children
        ) : (
          <Component
            className={`my-2 shadow appearance-none border border-opacity-50 rounded w-full py-2 px-3 text-grey-200 bg-opacity-50 bg-black  focus:outline-none focus:ring ring-thorium-400 ${
              error ? "border-red-500" : ""
            }`}
            type="text"
            {...props}
          />
        )}
      </label>
      <p className="text-red-500 text-xs italic">{error ? error : null}</p>
    </div>
  );
}
