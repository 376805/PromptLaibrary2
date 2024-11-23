import React from 'react';
import '../styles/Switch.css';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => (
  <label className="switch">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
    />
    <span className="slider round"></span>
  </label>
); 