import { ReactNode } from "react";

interface HeadingProps {
  title: string;
  subtitle?: ReactNode;
  size?: "lg" | "md";
}

const titleStyles = {
  lg: "text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl",
  md: "text-2xl font-bold tracking-tight text-gray-900",
};

export function Heading({ title, subtitle, size = "lg" }: HeadingProps) {
  return (
    <div className="text-center">
      <h1 className={titleStyles[size]}>{title}</h1>
      {subtitle && (
        <p className={`mt-3 text-gray-600 ${size === "lg" ? "text-lg" : "text-sm"}`}>{subtitle}</p>
      )}
    </div>
  );
}