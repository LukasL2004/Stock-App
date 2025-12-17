import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="nav">
      <div className="name">
        <p>WealthGrow</p>
      </div>
      <div className="links">
        <ul>
          <li>Home</li>
          <li>Wallet</li>
          <li>Your chart</li>
        </ul>
      </div>
      <div>
        <img className="profileImg" src="/poza_cv.jpg" alt="" />
      </div>
    </div>
  );
}
