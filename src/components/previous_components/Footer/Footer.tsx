import React from 'react';
import './Footer.css';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  /** Array of links to display in the footer */
  links?: FooterLink[];
  /** Background color override */
  backgroundColor?: string;
  /** Text color override */
  textColor?: string;
  /** Custom content to render alongside links */
  customContent?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Copyright text (defaults to current year) */
  copyright?: string;
  /** Whether to show the default copyright */
  showCopyright?: boolean;
  /** Company name for copyright */
  companyName?: string;
}

const Footer: React.FC<FooterProps> = ({
  links = [],
  backgroundColor,
  textColor,
  customContent,
  className = '',
  copyright,
  showCopyright = true,
  companyName = 'Your Company'
}) => {
  // Generate default copyright if not provided
  const defaultCopyright = copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

  // Create inline styles for color overrides
  const footerStyles: React.CSSProperties = {};
  if (backgroundColor) {
    footerStyles.backgroundColor = backgroundColor;
  }
  if (textColor) {
    footerStyles.color = textColor;
  }

  return (
    <footer 
      className={`footer ${className}`}
      style={footerStyles}
    >
      <div className="footer-container">
        {/* Links Section */}
        {links.length > 0 && (
          <div className="footer-links">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Custom Content Section */}
        {customContent && (
          <div className="footer-custom-content">
            {customContent}
          </div>
        )}

        {/* Copyright Section */}
        {showCopyright && (
          <div className="footer-copyright">
            <p>{defaultCopyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer; 