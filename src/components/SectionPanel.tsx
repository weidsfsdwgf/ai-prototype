import type { ReactNode } from "react";
import "./SectionPanel.css";

type SectionPanelProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionPanel({
  title,
  description,
  actions,
  children,
  className,
}: SectionPanelProps) {
  return (
    <section className={["section-panel", className].filter(Boolean).join(" ")}>
      {title || description || actions ? (
        <div className="section-panel__header">
          <div className="section-panel__copy">
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="section-panel__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="section-panel__body">{children}</div>
    </section>
  );
}
