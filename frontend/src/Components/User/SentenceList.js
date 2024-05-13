import React, { useState } from "react";
import axios from "axios";
import Card from "../UI/Card";
import styles from "./WordsList.module.css";
import More from "../UI/More";
import POSList from './POSList';
import EachSentence from "./EachSentence";


function count(str, find){
  return str.split(find).length -1;
}


const SentenceList = (props) => {
  let numberOfPurnaBirams =  count(props.currentSentences,'।');
  const allList = props.currentSentences.trim().split("।");
  const currentList = allList.splice(0,numberOfPurnaBirams);
  return (
    <Card className={styles.words}>
    <ul>
      {currentList.map((item, index) => {
        if (item === "") {
          return;
        }
        else{
          return (<EachSentence key= {Math.random()} currentSentence = {item+"।"} />)
        }
      })}
    </ul>
  </Card>
  );
};
export default SentenceList;