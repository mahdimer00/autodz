import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CONTACT, buildWhatsAppLink } from "../lib/constants";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function toContextValue(contact) {
  return {
    ...contact,
    telHref: `tel:${contact.phone}`,
    emailHref: `mailto:${contact.email}`,
    whatsappHref: (message) => buildWhatsAppLink(contact.phone, message),
  };
}

const ContactInfoContext = createContext(toContextValue(DEFAULT_CONTACT));

export function ContactInfoProvider({ children }) {
  const [contact, setContact] = useState(DEFAULT_CONTACT);

  useEffect(() => {
    fetch(`${API_BASE}/api/contact-info`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && data.contactInfo) {
          setContact((prev) => ({ ...prev, ...data.contactInfo }));
        }
      })
      .catch(() => {
        // keep defaults if the API is unreachable
      });
  }, []);

  return (
    <ContactInfoContext.Provider value={toContextValue(contact)}>
      {children}
    </ContactInfoContext.Provider>
  );
}

export function useContactInfo() {
  return useContext(ContactInfoContext);
}
