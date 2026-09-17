import "./Field.css";

export default function Field({ label, type = "text", value, onChange, required, name, placeholder }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={type === "password" ? "current-password" : "on"}
      />
    </label>
  );
}
