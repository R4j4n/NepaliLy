import React, { useState, Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./Components/UI/Header";
import TextArea from "./Components/User/TextArea";
import About from "./Components/About/About";

const App = () => {
  const [word, setWord] = useState("");
  const displayWordList = (word) => {
    // const wordArr = word.split(' ');
    setWord(word);
  };

  return (
    <Fragment>
      <Header></Header>
      <Routes>
        <Route
          path="/"
          element={<TextArea onSpacePress={displayWordList}></TextArea>}
        />
        <Route path="/about" element={<About></About>} />
      </Routes>
    </Fragment>
  );
};

export default App;
