import axios from "axios";
import React, { useState } from "react";
import Card from "../UI/Card";
import styles from "./WordsList.module.css";
import More from "../UI/More";
import POSList from "./POSList";
import Less from "../UI/Less";

const EachSentence = (props) => {
  const [displayPOS, setDisplayPOS] = useState("");
  const displayPOSHandler = async (sentence) => {
    console.log("Sentence to send for POS", sentence);
    const POSResponse = await axios.get(
      `http://localhost:8080/getPOStagging/${sentence}`
    );
    console.log(POSResponse.data);
    setDisplayPOS(POSResponse.data);
  };

  const HidePOSHandler = ()=>{
    setDisplayPOS('');
  };

  const Expand = (
    <More onClick={displayPOSHandler} sentence={props.currentSentence}>
      More
    </More>
  );

  const Collapse = (
      <Less onClick={HidePOSHandler}>
          Close
      </Less>
  )
  const switchButton = (displayPOS ? Collapse: Expand )
  return (
    <Card className={styles.words}>
      <li style={listStyle}>
        {props.currentSentence}
        {/* <More onClick={displayPOSHandler} sentence={props.currentSentence}>
          More
        </More> */}
        {switchButton}
      </li>
      {displayPOS && (
        <POSList
          currentSentenceObject={displayPOS}
          currentSentence={props.currentSentence}
        ></POSList>
      )}
    </Card>
  );
};
const listStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 0.1fr",
  gridGap: "1rem",
};
export default EachSentence;
