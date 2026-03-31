import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/contacts', form);
      toast.success('Thanks! We received your message.');
      setForm({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-shell">
        <div className="contact-panel">
          <p className="contact-kicker">Contact Us</p>
          <h1>We’d love to hear from you.</h1>
          <p className="contact-lead">
            Need help with an order or want styling advice? Drop a message and
            our support team will respond within 24 hours.
          </p>
          <div className="contact-info">
            <div>
              <MapPin size={16} />
              <span>14A Park Street, Kolkata, IN</span>
            </div>
            <div>
              <Mail size={16} />
              <span>support@aurarun.com</span>
            </div>
            <div>
              <Phone size={16} />
              <span>+91 70012 34567</span>
            </div>
          </div>
          <div className="contact-hours">
            <p>Support hours</p>
            <span>Mon–Sat · 9:00 AM – 8:00 PM</span>
          </div>
        </div>

        <div className="contact-form-card">
          <div className="contact-form-header">
            <h2>Let’s get in touch</h2>
            <p>We’ll respond quickly with the info you need.</p>
          </div>
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="contact-grid">
              <input name="name" type="text" placeholder="Full name" value={form.name} onChange={onChange} required />
              <input name="email" type="email" placeholder="Email address" value={form.email} onChange={onChange} required />
              <input name="company" type="text" placeholder="Company (optional)" value={form.company} onChange={onChange} />
              <input name="phone" type="tel" placeholder="Phone number" value={form.phone} onChange={onChange} />
            </div>
            <input name="subject" type="text" placeholder="Subject (optional)" value={form.subject} onChange={onChange} />
            <textarea name="message" rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={onChange} required />
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
