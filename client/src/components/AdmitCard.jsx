import "./AdmitCard.css";

export default function AdmitCard({ eyebrow, title, children }) {
  return (
    <div className="admit-card">
      <div className="admit-card__seal" aria-hidden="true">
        AP
      </div>
      <p className="admit-card__eyebrow">{eyebrow}</p>
      <h2 className="admit-card__title">{title}</h2>
      <div className="admit-card__body">{children}</div>
    </div>
  );
}
