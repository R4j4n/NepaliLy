import react, { useState, Fragment, useEffect, useRef } from "react";
import { ReactDOM } from "react";
import axios from "axios";
// Importing other components
import WordsList from "./WordsList";
import Button from "../UI/Button";
import SuggestionList from "../Suggestion/SuggestionList";
import GetPOS from "../UI/GetPOS";
import SentenceList from "./SentenceList";
import Spinner from "../UI/Spinner";
import NextWordPrediction from "./NWP";

// Main component function
const TextArea = (props) => {
  const [textInTextArea, setTextInTextArea] = useState("");
  const [textInDiv, setTextInDiv] = useState("");
  const [posList, setPostList] = useState("");
  const [sentenceArray, setSentenceArray] = useState([]);
  const [indexToChange, setIndexToChange] = useState("");
  const [suggestionList, setSuggestionList] = useState(false);
  const [probableWords, setProbableWords] = useState([]);
  const [predictedState, setPredictedState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictedWords, setPredictedWords] = useState([]);
  const [left, setLeft] = useState("1.5rem");
  const [top, setTop] = useState("3.5rem");
  const regex = /[a-zA-Z0-9.]/;

  // To display nepali text in text area;
  const textChangeHandler = (event) => {
    setTextInTextArea((prevState) => {
      prevState = event.target.value;
      return prevState;
    });
    setSuggestionList(false);
  };

  var underlineWords = async (event) => {
    console.log("Underline Function Called");
    var prevDivText = [];
    if (!textInTextArea) {
      setTextInDiv("");
      return;
    }
    const newArr = event.target.value
      .trim()
      .split(" ")
      .filter((item) => {
        return item !== "";
      });
    console.log("New Arr", newArr);
    for (let word of newArr) {
      const correctnessResponse = await fetch(
        `http://localhost:8080/checkMisspelled/${word}`
      );
      const isNotCorrectResponse = await correctnessResponse.json();
      const isNotCorrect = isNotCorrectResponse["is_misspelled"];
      if (isNotCorrect) {
        const highlightedWord = `<span>${word}</span>`;
        prevDivText.push(highlightedWord);
      } else {
        const paraWord = `<p>${word}</p>`;
        prevDivText.push(paraWord);
      }
    }
    console.log("PrevDivState outside for loop", prevDivText);
    prevDivText = prevDivText.join(" ");
    setTextInDiv((prevDivState) => {
      prevDivState = prevDivText;
      console.log(prevDivState);
      return prevDivState;
    });
  };

  // function to run when input changes
  const inputChangeHandler = async (event) => {
    setIsLoading(false);
    setPredictedState(false);
    setPostList("");
    //When space is pressed
    if (event.keyCode === 32) {
      const currentText = event.target.value.trim().split("");
      const valueToTranslate = currentText.filter((item) => {
        return regex.test(item); // using regular expression to determine only english language or numbers are sent for transliteration
      });
      let currentVal = valueToTranslate.join("");
      const isSpace =
        currentText.findIndex((item) => {
          return regex.test(item);
        }) - 1;

      var addSuffix = "";
      if (currentText[isSpace] !== " ") {
        if (isSpace === -1) {
          addSuffix = "";
        } else {
          const wordToAddSuffixOn = currentText.join("").split(" ");
          console.log("Words", wordToAddSuffixOn);
          for (let word of wordToAddSuffixOn) {
            if (word.includes(currentVal)) {
              addSuffix = word.split(currentVal)[0];
            }
          }
        }
      }
      if (!currentVal) {
        return;
      }
      if (!regex.test(currentVal)) {
        return;
      }
      if (currentVal === ".") {
        currentVal = "|";
      }

      const response = await axios.get(
        `http://localhost:8080//transliterate/${currentVal}`
      );
      const transliteratedWord = response.data["trans_output"]; //transliterated word ends up here

      const transliteratedWordWithSuffix = addSuffix + transliteratedWord;
      addSuffix = "";

      var mousePosition = 0; // to calculate where mouse position should end up
      var index = 0;
      // function to show text in text area
      setTextInTextArea((prevState) => {
        prevState = prevState.trim().split(" ");
        index = prevState.findIndex((item) => {
          return regex.test(item);
        });
        prevState = prevState.filter((item) => {
          return !regex.test(item);
        });
        prevState.splice(index, 0, transliteratedWordWithSuffix);

        for (let i = 0; i <= index; i++) {
          mousePosition += prevState[i].length + 1;
        }
        prevState = prevState.join(" ");
        if (prevState) {
          prevState = prevState + " ";
        }
        event.target.selectionEnd = mousePosition;

        //To underline errornous words
        const underlineErrorWords = async () => {
          var prevDivText = [];
          const newArr = prevState
            .trim()
            .split(" ")
            .filter((item) => {
              return item !== "";
            });
          console.log("Sent for correction", newArr);

          for (let word of newArr) {
            const correctnessResponse = await fetch(
              `http://localhost:8080/checkMisspelled/${word}`
            );
            const isNotCorrectResponse = await correctnessResponse.json();
            const isNotCorrect = isNotCorrectResponse["is_misspelled"];
            if (isNotCorrect) {
              const highlightedWord = `<span>${word}</span> `;
              prevDivText.push(highlightedWord);
            } else {
              const paraWord = `<p>${word}</p>`;
              prevDivText.push(paraWord);
            }
          }
          prevDivText = prevDivText.join(" ");
          setTextInDiv((prevDivState) => {
            prevDivState = prevDivText;
            return prevDivState;
          });
        };
        underlineErrorWords();
        const allSentences = prevState.trim().split("।");
        const lastSentence = allSentences.slice(-1);
        const lastWord = lastSentence.join(" ").trim().split(" ").slice(-1);
        const isLastWordError = async () => {
          const checkError = await axios.get(
            `http://localhost:8080/checkMisspelled/${lastWord}`
          );
          const checkIfError = checkError.data["is_misspelled"];
          if (prevState.trim().slice(-1) !== "।" && checkIfError === false) {
            const predictNextWord = async () => {
              const nextWordResponse = await axios.get(
                `http://localhost:8080/nextWord/${allSentences.slice(-1)}`
              );
              setPredictedWords(nextWordResponse.data.next_words);
              setPredictedState(true);
            };
            predictNextWord();
          }
        };
        isLastWordError();

        return prevState;
      });
      event.target.selectionEnd = mousePosition;
      setIndexToChange(index);
    }
  };

  // To display the dynamic list for pos and to send http request for the latest word provided
  const displayListHandler = (event) => {
    if (event.keyCode === 32) {
      setPostList("");
    }
    if (event.keyCode === 8) {
      underlineWords(event);
    }
  };

  // To clear the text field when clear button is pressed
  const inputClearHandler = (event) => {
    event.preventDefault();
    setTextInTextArea("");
    setTextInDiv("");
    setPostList("");
    setSuggestionList(false);
    setIsLoading(false);
    setPredictedState(false);
  };

  //To make the suggestions clickable
  const selectSuggestionHandler = (word, event) => {
    setTextInTextArea((prevState) => {
      prevState = prevState.trim().split(" ");
      console.log("Showing prevState for clicks", prevState);
      console.log("Index to change is", indexToChange);
      prevState.splice(indexToChange, 1, word);
      console.log("showing prevState after click", prevState);
      prevState = prevState.join(" ");
      console.log("prevState after joining", prevState);
      const underlineErrorWords = async () => {
        var prevDivText = [];
        const newArr = prevState.trim().split(" ");

        for (let word of newArr) {
          const correctnessResponse = await fetch(
            `http://localhost:8080/checkMisspelled/${word}`
          );
          const isNotCorrectResponse = await correctnessResponse.json();
          const isNotCorrect = isNotCorrectResponse["is_misspelled"];
          if (isNotCorrect) {
            const highlightedWord = `<span>${word}</span> `;
            prevDivText.push(highlightedWord);
          } else {
            const paraWord = `<p>${word}</p>`;
            prevDivText.push(paraWord);
          }
        }

        prevDivText = prevDivText.join(" ");
        setTextInDiv((prevDivState) => {
          prevDivState = prevDivText;
          return prevDivState;
        });
      };
      underlineErrorWords();

      return prevState;
    });
    setSuggestionList(false);
  };

  //To make the predicted values clickable
  const selectPredictionHandler = (item) => {
    setTextInTextArea((prevState) => {
      prevState = prevState.trim().split(" ");
      console.log("Showing prevState for clicks", prevState);
      const lastIndex = prevState.length;
      prevState.splice(lastIndex, 0, item);
      console.log("showing prevState after click", prevState);
      prevState = prevState.join(" ");
      console.log("prevState after joining", prevState);
      const underlineErrorWords = async () => {
        var prevDivText = [];
        const newArr = prevState.trim().split(" ");
        for (let word of newArr) {
          const correctnessResponse = await fetch(
            `http://localhost:8080/checkMisspelled/${word}`
          );
          const isNotCorrectResponse = await correctnessResponse.json();
          const isNotCorrect = isNotCorrectResponse["is_misspelled"];
          if (isNotCorrect) {
            const highlightedWord = `<span>${word}</span> `;
            prevDivText.push(highlightedWord);
          } else {
            const paraWord = `<p>${word}</p>`;
            prevDivText.push(paraWord);
          }
        }
        prevDivText = prevDivText.join(" ");
        setTextInDiv((prevDivState) => {
          prevDivState = prevDivText;
          return prevDivState;
        });
      };
      underlineErrorWords();

      return prevState;
    });
    setPredictedState(false);
  };

  // To display suggestion when a word is clicked
  const selectTextHandler = async (event) => {
    const startPosition = event.target.selectionStart;
    const endPosition = event.target.selectionEnd;
    console.log("scroll left", document.body.scrollLeft);
    let X = event.clientX;
    let Y = event.clientY;
    console.log(X, Y);
    X = X - 30 + "px";
    Y = Y - 550 + "px";
    setLeft(X);
    setTop(Y);
    console.log(X, Y);
    if (startPosition === 0 || endPosition === 0) {
      return;
    }
    const value = event.target.value.trim().split(" ");
    console.log("Value is", value);
    if (!value) {
      return;
    }
    var length = 0;
    var wordList = [];
    for (let word of value) {
      length += word.length + 1;
      if (length > startPosition) {
        wordList.push(word);
      }
    }
    const suggestionFor = wordList[0];
    const index = value.findIndex((item) => {
      return item === suggestionFor;
    });
    setIndexToChange(index);
    const isNotCorrectResponse = await axios.get(
      `http://localhost:8080/checkMisspelled/${suggestionFor}`
    );
    const isNotCorrect = isNotCorrectResponse.data["is_misspelled"];
    if (!isNotCorrect) {
      console.log("The word is correct");
      return;
    }
    setIsLoading(true);
    const probableSuggestionResponse = await axios.get(
      `http://localhost:8080/getSuggestion/${suggestionFor}`
    );
    setSuggestionList(true);
    setProbableWords(probableSuggestionResponse.data.suggestion);
    setIsLoading(false);
    setPredictedState(false);
  };

  const posClickHandler = async (event) => {
    event.preventDefault();
    if (!textInTextArea) {
      return;
    }
    // const arraySentence = textInTextArea.trim().split("।");
    const arraySentence = textInTextArea;
    setSentenceArray(arraySentence);
    setPostList(true);
    setPredictedState(false);
  };

  return (
    <Fragment>
      <div className="allThree"> {/* <div style = {allThree}> */}
        <div id="transliteration">
          <div>
            <h2>Perform Transliteration </h2>
          </div>
          <div id="textarea">
            <div>
              <form onSubmit={inputClearHandler} id="form">
                <div id="container-div">
                  <div id="x-field">
                    <textarea
                      id="x-field-input"
                      placeholder="Type your words in romanized script."
                      value={textInTextArea}
                      onChange={textChangeHandler}
                      onKeyDown={inputChangeHandler}
                      onKeyUp={displayListHandler}
                      onDoubleClick={selectTextHandler}
                    ></textarea>

                    <br />

                    <div
                      contentEditable={true}
                      dangerouslySetInnerHTML={{ __html: textInDiv }}
                      id="likeInput"
                    />
                  </div>
                  <div className="btn-div">
                    <ul className="ulStyle">{/* <ul style = {ulStyle}> */}
                      <li className="liStyle">{/* <li style = {liStyle}> */}
                        <Button type="submit">Clear</Button>
                      </li>
                      <li className="liStyle">{/* <li style = {liStyle}> */}
                        <GetPOS type="btn" onClick={posClickHandler}>
                          Get POS
                        </GetPOS>
                      </li>
                    </ul>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {isLoading && <Spinner />}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div id="nwp-div" >
          <h4>Prediction</h4>
          {predictedState && (
            <NextWordPrediction
              predictedArray={predictedWords}
              onClickSuggestion={selectPredictionHandler}
            />
          )}
        </div>

        <div>
          <div id="pos-div">
            <h2>POS</h2>
            <p>Please type a complete sentence for POS.</p>
            {posList && (
              <SentenceList currentSentences={sentenceArray}></SentenceList>
            )}
          </div>
        </div>
      </div>
      <div id="dialog" style={{ top: top, left: left }}>
        {suggestionList && (
          <SuggestionList
            suggestionList={probableWords}
            onClickSuggestion={selectSuggestionHandler}
          ></SuggestionList>
        )}
      </div>
    </Fragment>
  );
};
//Styles 
// const allThree = {
//   margin: "0",
//   marginTop: '5rem',
//   display: "grid",
//   gridTemplateColumns: "1fr 0.2fr 1fr",
//   gridGap: "0.5rem",
//   backgroundColor: "#f4f4f4",
// };

// const ulStyle = {
//   listStyleType: "none",
//   display: "flex",
//   flexDirection: "row",
//   justifyContent: "center",
// };

// const liStyle = {
//   margin: "0 0.5rem",
// };

export default TextArea;
