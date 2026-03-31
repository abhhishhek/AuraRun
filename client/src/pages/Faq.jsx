const FAQS = [
  {
    q: 'When will my order ship?',
    a: 'Orders are packed within 24 hours. Standard shipping delivers in 3-5 business days.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes. International shipping takes 7-12 business days with duties calculated at checkout.',
  },
  {
    q: 'How do returns work?',
    a: 'Returns are accepted within 30 days of delivery. Items must be unworn with original tags.',
  },
  {
    q: 'Can I exchange sizes?',
    a: 'Absolutely. Start an exchange from your account page or contact support for help.',
  },
  {
    q: 'Where is my refund?',
    a: 'Refunds are processed within 5 business days after we receive your return.',
  },
  {
    q: 'Do you offer student or team discounts?',
    a: 'Yes! Email support@aurarun.com with verification to unlock special pricing.',
  },
];

export default function Faq() {
  return (
    <div className="faq-page">
      <div className="faq-header">
        <p className="faq-kicker">Shop FAQs</p>
        <h1>Find quick answers</h1>
        <p>
          Can’t find what you’re looking for? Reach out and we’ll get back within 24 hours.
        </p>
      </div>

      <div className="faq-list">
        {FAQS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
