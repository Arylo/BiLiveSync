import type { ButtonHTMLAttributes, PropsWithChildren, ReactElement } from "react";

export type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const Button = ({ children, ...props }: ButtonProps): ReactElement => (
  <button
    {...props}
    className={`inline-flex items-center rounded-md border px-3 py-2 text-sm ${props.className ?? ""}`.trim()}
    type={props.type ?? "button"}
  >
    {children}
  </button>
);
