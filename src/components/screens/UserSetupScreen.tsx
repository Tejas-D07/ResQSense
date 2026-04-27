import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../../types';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function UserSetupScreen({ onComplete }: Props) {
  const [form, setForm] = useState<UserProfile>({
    name: '', phone: '', email: '', emergencyContacts: [''],
  });
  const [errors, setErrors] = useState<Partial<UserProfile>>({});
  const [contactErrors, setContactErrors] = useState<string[]>([]);
  const [focused, setFocused] = useState<string | null>(null);

  const validate = (): boolean => {
    const e: Partial<UserProfile> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) e.phone = 'Valid phone number required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';

    const contactErrors: string[] = [];
    const contacts = form.emergencyContacts.map(contact => contact.trim());
    if (!contacts.some(Boolean)) {
      contactErrors[0] = 'Add at least one emergency contact';
    } else {
      contacts.forEach((contact, index) => {
        if (!contact) {
          contactErrors[index] = 'Required';
        } else if (!/(\+?\d[\d\s\-()]{6,})/.test(contact)) {
          contactErrors[index] = 'Valid phone number required';
        }
      });
    }

    setErrors(e);
    setContactErrors(contactErrors);
    return Object.keys(e).length === 0 && contactErrors.every(err => !err);
  };

  const handleSubmit = () => {
    if (validate()) onComplete(form);
  };

  const fields: { key: keyof UserProfile; label: string; placeholder: string; type?: string }[] = [
    { key: 'name',  label: 'Full Name',  placeholder: 'Jane Doe' },
    { key: 'phone', label: 'Your Phone', placeholder: '+1 555 000 0000', type: 'tel' },
    { key: 'email', label: 'Your Email', placeholder: 'jane@example.com', type: 'email' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--color-void)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-pulse)', letterSpacing: '0.2em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            Step 2 of 3
          </div>
          <h2 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)', marginBottom: 10,
          }}>
            Your Profile
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Used only during emergencies to contact help.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {fields.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 + 0.1 }}
            >
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: errors[f.key] ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                marginBottom: 6,
              }}>
                {f.label}
                {errors[f.key] && (
                  <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    — {errors[f.key]}
                  </span>
                )}
              </label>
              <input
                type={f.type || 'text'}
                value={form[f.key]}
                placeholder={f.placeholder}
                onFocus={() => setFocused(f.key)}
                onBlur={() => setFocused(null)}
                onChange={e => {
                  setForm(prev => ({ ...prev, [f.key]: e.target.value }));
                  if (errors[f.key]) setErrors(prev => ({ ...prev, [f.key]: undefined }));
                }}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: focused === f.key
                    ? 'rgba(37,99,235,0.06)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    errors[f.key] ? 'rgba(239,68,68,0.5)'
                    : focused === f.key ? 'rgba(37,99,235,0.4)'
                    : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12,
                  color: 'var(--color-text-primary)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: fields.length * 0.08 + 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-secondary)',
              }}>
                Emergency Contacts
              </label>
              <button
                type="button"
                onClick={() => setForm(prev => ({
                  ...prev,
                  emergencyContacts: [...prev.emergencyContacts, ''],
                }))}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-text-primary)', borderRadius: 10, padding: '8px 12px',
                  fontSize: 12, cursor: 'pointer', fontWeight: 700,
                }}
              >
                + Add contact
              </button>
            </div>

            {form.emergencyContacts.map((contact, index) => (
              <div key={index} style={{ display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={contact}
                    placeholder="Name — +1 555 999 9999"
                    onFocus={() => setFocused(`contact-${index}`)}
                    onBlur={() => setFocused(null)}
                    onChange={e => {
                      setForm(prev => ({
                        ...prev,
                        emergencyContacts: prev.emergencyContacts.map((item, i) => i === index ? e.target.value : item),
                      }));
                      setContactErrors(prev => prev.map((err, i) => (i === index ? '' : err)));
                    }}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: focused === `contact-${index}` ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${contactErrors[index] ? 'rgba(239,68,68,0.5)' : focused === `contact-${index}` ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.07)'}`,
                      color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', transition: 'all 0.2s ease',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  {form.emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
                      }))}
                      style={{
                        background: 'rgba(239,68,68,0.12)', border: 'none', color: '#fff',
                        borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontSize: 12,
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {contactErrors[index] && (
                  <span style={{ color: 'var(--color-danger)', fontSize: 12 }}>
                    {contactErrors[index]}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', padding: '15px 24px',
            borderRadius: 14, fontSize: 14, fontWeight: 700,
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            border: 'none', color: '#fff', cursor: 'pointer',
            boxShadow: '0 0 40px -8px rgba(37,99,235,0.5)',
          }}
        >
          Activate Protection →
        </motion.button>
      </motion.div>
    </div>
  );
}
