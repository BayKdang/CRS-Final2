import React from 'react';

const FAQ = () => {
  const faqItems = [
    {
      id: 'faq1',
      question: 'Do you offer financing options?',
      answer: 'Yes, we offer a variety of financing options to fit your budget. Our finance team works with multiple lenders to secure competitive rates and flexible terms. We can help with loan pre-approval before you even choose your vehicle.'
    },
    {
      id: 'faq2',
      question: 'What warranty comes with your vehicles?',
      answer: 'All new vehicles come with the manufacturer\'s warranty. For used vehicles, we offer a 3-month/3,000-mile limited warranty. Extended warranty options are available for purchase to provide additional peace of mind.'
    },
    {
      id: 'faq3',
      question: 'Can I trade in my current vehicle?',
      answer: 'Absolutely! We accept trade-ins and will provide a fair market evaluation of your vehicle. The trade-in value can be applied directly to your new purchase, potentially reducing your out-of-pocket costs and taxes.'
    },
    {
      id: 'faq4',
      question: 'How do I schedule a test drive?',
      answer: 'You can schedule a test drive through our website, by phone, or by visiting our dealership. We recommend scheduling in advance to ensure the vehicle you\'re interested in is ready when you arrive.'
    }
  ];

  return (
    <section id="faq" className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Frequently Asked Questions</h2>
          <p className="lead text-muted">Find answers to common questions about our services</p>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion" id="faqAccordion">
              {faqItems.map((item, index) => (
                <div className="accordion-item" key={item.id}>
                  <h2 className="accordion-header">
                    <button 
                      className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`} 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#${item.id}`}
                    >
                      {item.question}
                    </button>
                  </h2>
                  <div 
                    id={item.id} 
                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;