import React, { useState } from "react";
import Card from "../UI/Card";
import styles from "./WordsList.module.css";

const WordsList = (props) => {
  const [currentList, setCurrentList]=useState('');
  return (
    <Card className={styles.words}>
      <ul>
        {props.typedWord.map((item) => {
          if (item === "") {
            return;
          }
          else{
            return <li key={Math.random()}>{item}</li>
          }
        })}
        {/* <li>{props.typedWord}</li> */}
      </ul>
    </Card>
  );
};
export default React.memo(WordsList);
