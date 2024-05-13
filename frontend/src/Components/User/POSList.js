import React, { useState } from "react";
import Card from "../UI/Card";
import styles from "./WordsList.module.css";

const POSList = (props) => {
  const posValues = Object.values(props.currentSentenceObject);
  const posObject = props.currentSentenceObject;
  const symbolArray = ['!', ',', '?', '@', '#', '$', '%', '^', '&', '*']
  const currentSentence = props.currentSentence.split(' ').filter((item)=>{
    return !symbolArray.includes(item)
  });
  console.log('Pos Values', posValues);
  return (
    <Card className={styles.words}>
    <ul>
      {currentSentence.map((item, index) => {
        if (item === "") {
          return;
        }
        else{
          // return <li key={Math.random()}>{`${item}:${posValues[index]}`}</li>
          return <li key={Math.random()}>{`${item}:${posObject[item]}`}</li>

        }
      })}
    </ul>
  </Card>
  );
};
export default React.memo(POSList);