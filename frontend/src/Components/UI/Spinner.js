import { Fragment } from "react/cjs/react.production.min";
import spinner from "./spinning.gif";

const Spinner = () => {
  return (
    <Fragment>
      <img
        src={spinner}
        alt="Loading..."
        style={{ width: "100px", margin: "auto", display: "block" }}
      />
    </Fragment>
  );
};
export default Spinner;
