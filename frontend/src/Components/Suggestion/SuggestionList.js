import React from "react";
import styles from "./SuggestionList.module.css";
import SingleSuggestion from "./SingleSuggestion";

const SuggestionList = (props) => {
  return (
    <div className={styles.container}>
      <ul className={styles.ul}>
        {props.suggestionList.map((item, index) => {
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
    </div>
  );
};

export default SuggestionList;
