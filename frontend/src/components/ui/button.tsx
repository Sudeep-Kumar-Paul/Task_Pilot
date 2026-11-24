import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | "google";
type Size = "default" | "sm" | "lg" | "icon";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}
export function buttonVariants({
  variant = "default",
  size = "default",
  className = "",
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return `tp-button tp-button--${variant} tp-button--${size} ${className}`;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "default", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
});
