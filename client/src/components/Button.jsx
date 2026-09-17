import "./Button.css";

export default function Button({ children, variant = "primary", type = "button", onClick, disabled }) {
  return (
    <button
      className={`btn btn--${variant}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
