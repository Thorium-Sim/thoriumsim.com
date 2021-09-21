import {ReactNode, DetailedHTMLProps, HTMLAttributes} from "react";

export function Pill<
  T extends DetailedHTMLProps<
    HTMLAttributes<HTMLElement>,
    HTMLElement
  > = DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
>({
  children,
  className,
  as: Component = "span",
  ...props
}: T & {
  as?: React.ElementType<any>;
}) {
  return (
    <Component
      className={`${className} appearance-none text-xs border rounded-full h-4 px-1 py-px inline-flex items-center justify-center`}
      {...props}
    >
      {children}
    </Component>
  );
}
