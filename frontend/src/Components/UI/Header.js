import react from "react";
import Button from "./Button";
import { Link } from "react-router-dom";

const Header = (props) => {
  return (
    <header className='navbar bg-primary'>
      <h1>Nepali Text Mate</h1>
      <ul className="ulStyles">
        <li className="liStyles">
          <Link to="/"><Button>Home</Button></Link>
        </li>
        <li className="liStyles">
          <Link to="/about"><Button>About</Button></Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
