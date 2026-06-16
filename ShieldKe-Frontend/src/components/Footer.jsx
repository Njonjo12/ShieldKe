import { motion } from "framer-motion";

import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin
} from "react-icons/fi";

export default function Footer() {

  const year = new Date().getFullYear();

  return (

    <footer className="footer">

      {/* ========================================
          TOP SECTION
      ======================================== */}

      <div className="footer-top">

        {/* BRAND */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="footer-brand"
        >

          <h2 className="footer-logo">
            Shield<span>Ke</span>
          </h2>

          <p className="footer-text">

            Kenya’s modern legal-tech platform
            connecting citizens with verified
            advocates securely and efficiently.

          </p>

          <div className="footer-socials">

            <motion.a
              whileHover={{ y: -3 }}
              href="/"
            >
              <FiFacebook />
            </motion.a>

            <motion.a
              whileHover={{ y: -3 }}
              href="/"
            >
              <FiTwitter />
            </motion.a>

            <motion.a
              whileHover={{ y: -3 }}
              href="/"
            >
              <FiInstagram />
            </motion.a>

            <motion.a
              whileHover={{ y: -3 }}
              href="/"
            >
              <FiLinkedin />
            </motion.a>

          </div>

        </motion.div>

        {/* LINKS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="footer-links"
        >

          <h3>
            Platform
          </h3>

          <a href="/">
            Home
          </a>

          <a href="/login">
            Login
          </a>

          <a href="/register">
            Register
          </a>

          <a href="/lawyers">
            Lawyers
          </a>

        </motion.div>

        {/* LEGAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="footer-links"
        >

          <h3>
            Legal
          </h3>

          <a href="/">
            Privacy Policy
          </a>

          <a href="/">
            Terms & Conditions
          </a>

          <a href="/">
            Security
          </a>

          <a href="/">
            Support
          </a>

        </motion.div>

        {/* CONTACT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="footer-contact"
        >

          <h3>
            Contact
          </h3>

          <p>
            <FiMail />
            support@shieldke.co.ke
          </p>

          <p>
            <FiPhone />
            +254 700 000000
          </p>

          <p>
            <FiMapPin />
            Nairobi, Kenya
          </p>

        </motion.div>

      </div>

      {/* ========================================
          BOTTOM
      ======================================== */}

      <div className="footer-bottom">

        <p>
          © {year} ShieldKe.
          All rights reserved.
        </p>

      </div>

    </footer>

  );

}