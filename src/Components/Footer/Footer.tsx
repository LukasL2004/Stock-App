import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} WealthGrow. Paper-trading project; no real money is invested.</p>
        <ul>
          <li><a href="#main">Privacy</a></li>
          <li><a href="#main">Terms</a></li>
          <li><a href="#main">Support</a></li>
        </ul>
      </div>
    </footer>
  );
}
