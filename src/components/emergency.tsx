// pages/emergency.tsx or src/pages/Emergency.jsx
import React from "react";

const emergencyContacts = [
  {
    title: "Edhi Ambulance",
    phone: "115",
    description: "24/7 emergency ambulance service by Edhi Foundation.",
  },
  {
    title: "Rescue 1122",
    phone: "1122",
    description: "Government emergency ambulance, fire, and rescue services.",
  },
  {
    title: "Police Emergency",
    phone: "15",
    description: "Report crimes and emergencies to the local police.",
  },
  {
    title: "Fire Brigade",
    phone: "16",
    description: "Call in case of fire emergencies.",
  },
  {
    title: "CPLC (Citizens Police Liaison Committee)",
    phone: "1102",
    description: "Report crimes and get assistance in Karachi.",
  },
  {
    title: "Pakistan Red Crescent",
    phone: "+92 51 9250404",
    description: "Emergency and disaster relief organization.",
  },
  {
    title: "Women’s Helpline",
    phone: "1099",
    description: "Support and legal help for women.",
  },
  {
    title: "Cyber Crime (FIA)",
    phone: "1991",
    description: "Report cyber harassment and crimes.",
  },
];

export default function EmergencyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Emergency Contacts</h1>
      <p className="text-gray-600 mb-8">
        In case of emergency, contact the appropriate service below.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {emergencyContacts.map((contact, index) => (
          <div
            key={index}
            className="border border-red-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition duration-300 bg-white"
          >
            <h2 className="text-xl font-semibold text-red-600">{contact.title}</h2>
            <p className="text-gray-700 mt-1">{contact.description}</p>
            <p className="mt-3 font-mono text-lg text-gray-900">
              📞 {contact.phone}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
