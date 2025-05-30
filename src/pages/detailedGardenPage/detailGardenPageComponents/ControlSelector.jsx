import React from 'react';
import { Droplets, Sun, Wind } from "lucide-react";
import i18n from '../../../i18n';

const ControlSelector = ({ selectedControl, setSelectedControl }) => {
  return (
    <div className="flex gap-3">
      {[
        {
          key: "water",
          label: i18n.t("water"),
          icon: <Droplets size={18} className="mr-1" />,
        },
        {
          key: "light",
          label: i18n.t("light"),
          icon: <Sun size={18} className="mr-1" />,
        },
        {
          key: "wind",
          label: i18n.t("wind"),
          icon: <Wind size={18} className="mr-1" />,
        },
      ].map((control) => (
        <button
          key={control.key}
          onClick={() => setSelectedControl(control.key)}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center ${
            selectedControl === control.key
              ? "bg-green-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {control.icon}
          {control.label}
        </button>
      ))}
    </div>
  );
};

export default ControlSelector; 