import "./Navbar.css";
import { useNavigate } from "react-router";
import { MdOutlineTrendingUp } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";
import { VscThreeBars } from "react-icons/vsc";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const dropdown = () => {
    setIsOpened(!isOpened);
  };

  const toHome = () => {
    navigate("/LandingPage");
  };

  function toProfile() {
    navigate("/Profile");
  }

  const toLogOut = () => {
    navigate("/Wallet");
  };

  function Home() {
    navigate("/LandingPage");
  }

  return (
    <div>
      <div className="nav">
        <div className="left">
          <div onClick={toHome} className="navAppLogo">
            <MdOutlineTrendingUp className="navIcon" />
            <h2 className="appName">WealthGrow</h2>
          </div>
        </div>
        <div className="navSpliter">
          <div className="navLinks">
            <ul className="links">
              <li onClick={Home}>Home</li>
              <li onClick={toLogOut}>Wallet</li>
              <li>Your chart</li>
            </ul>
          </div>
          <div className="profileWrapper">
            <FaRegBell className="bell" />
            <img
              onClick={toProfile}
              className="profileImg"
              src="/poza_cv.jpg"
              alt="profile"
            />
          </div>
        </div>
        <div onClick={dropdown} className="navRespIcon">
          {isOpened ? <IoClose /> : <VscThreeBars />}
        </div>
      </div>
      {isOpened && (
        <div className="mobileMenu">
          <ul className="mobileLinks">
            <li
              onClick={() => {
                toHome();
                dropdown();
              }}
            >
              Home
            </li>
            <li
              onClick={() => {
                toLogOut();
                dropdown();
              }}
            >
              Wallet
            </li>
            <li onClick={dropdown}>Your chart</li>
            <li
              onClick={() => {
                toProfile();
                dropdown();
              }}
            >
              Profile
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
