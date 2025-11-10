
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-brand-surface/90 backdrop-blur-sm rounded-xl border border-brand-border/30 shadow-sm p-6 ${className}`}>
      <h3 className="text-base font-semibold text-brand-text-secondary mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default Card;
