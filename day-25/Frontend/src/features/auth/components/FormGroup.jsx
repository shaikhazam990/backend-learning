import React from "react";

// FormGroup is a reusable input component used in Login and Register
// It automatically sets input type based on the label name
// so password fields are hidden and email fields use email keyboard on mobile

const FormGroup = ({ label, placeholder, value, onChange }) => {

  // Determine input type from label so we don't need to pass it manually
  function getInputType(label) {
    const lower = label.toLowerCase();
    if (lower === "password") return "password";
    if (lower === "email")    return "email";
    return "text";
  }

  return (
    <div className="form-group">
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        name={label}
        type={getInputType(label)}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
};

export default FormGroup;