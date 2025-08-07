import React from "react";
import type { ReactNode } from "react";
import SpeechAwareTooltip from "./SpeechAwareTooltip";

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  title?: string;
  style?: React.CSSProperties;
}

/**
 * A component that wraps links with speech-aware tooltips and prevents navigation when text-to-speech is enabled
 */
const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  title,
  style,
}) => {
  return (
    <SpeechAwareTooltip title={title}>
      <a
        href={href}
        className={className}
        target={target}
        rel={rel}
        style={{
          ...style,
          color: "inherit",
          textDecoration: "inherit",
        }}
      >
        {children}
      </a>
    </SpeechAwareTooltip>
  );
};

export default SafeLink;
