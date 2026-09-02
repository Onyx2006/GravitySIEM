import clsx from "clsx";

export default function GlitchText({
  text,
  as: Tag = "h1",
  className,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
}) {
  return (
    <Tag data-text={text} className={clsx("glitch", className)}>
      {text}
    </Tag>
  );
}