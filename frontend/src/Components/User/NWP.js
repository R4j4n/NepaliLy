import React from "react";
import { Fragment } from "react/cjs/react.development";
import styles from "./NWP.module.css";
import SingleSuggestion from "../Suggestion/SingleSuggestion";


const NextWordPrediction = (props) => {
  return (
    <Fragment>
      <ul className={styles.ul}>
        {props.predictedArray.map((item, index) => {
          return (
            <SingleSuggestion
              key={Math.random()}
              item={item}
              onClick={props.onClickSuggestion}
              index={index}
            />
          );
        })}
      </ul>
    </Fragment>
  );
};

export default NextWordPrediction;
