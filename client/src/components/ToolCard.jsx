import { Link } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import "./ToolCard.css";

export default function ToolCard({ icon, accent, title, body, to, ctaLabel }) {
  return (
    <article className={`tool-card tool-card--${accent}`}>
      <span className="tool-card__icon">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="tool-card__title">{title}</h3>
      <p className="tool-card__body">{body}</p>
      <Link to={to} className="tool-card__cta">
        {ctaLabel}
        <Icon name="arrow-right" size={15} />
      </Link>
    </article>
  );
}
