import React from "react";
import styles from "./SuggestionList.module.css";

const SingleSuggestion = (props) => {
  const clickSuggestionHandler = (event) => {
    props.onClick(props.item);
  };
  return (
    <li className={styles.li} onClick={clickSuggestionHandler}>
      {props.item}
    </li>
  );
};
export default SingleSuggestion;
