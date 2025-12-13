import React, { useEffect, useState } from 'react';
import { quotes } from '../services/quotes';
import './Quote.css';

const Quote: React.FC = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  return (
    <div className="quote-container">
      <p className="quote-text">"{quote}"</p>
    </div>
  );
};

export default Quote;
