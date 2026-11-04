import Link, { LinkProps } from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export const buttonStyles = (variant: Variant = "primary", className = "") =>
  `${base} ${variants[variant]} ${className}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ variant = "primary", className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonStyles(variant, className)} {...props}>
      {children}
    </Link>
  );
}