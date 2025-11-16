import React from 'react';

const Footer = () => {
  return (
    <>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>Copyright © {new Date().getFullYear()} — All rights reserved by SML.</p> 
          <p>Created by BSCS-3A Group 2.</p>
        </aside>
      </footer>
    </>
  );
}

export default Footer;
