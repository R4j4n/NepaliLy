import React from "react";
import Members from "./Members";

const About = () => {
  return (
    <div className="container">
      <div className="card">
      <h1 style={{ textAlign: "center" }}>Abstract</h1>
        <p>
          Nepali Text Mate is a versatile Nepali script application that allows
          us to type in Devanagari script with ease. <br />
          Users can use this application to transliterate a Romanized script
          into Devanagari script with minimum errors, auto-predict the next word
          and to recognize the part of speech in Nepali script.
          <br />
          A sentence is not just a cluster of words but the meaning holds an
          equal amount of significance. During transliteration sometimes that
          value gets lost but not to worry, we will portray just the right
          meaning with fast and accurate transliteration with just click of a
          key.
          <br />A versatile transliteration tool designed to bring speed and
          accuracy with its variety of features. Users won't have to be worried
          about double-checking their content, it's our promise you'll find the
          transliteration that will match up your standards just fine.
        </p>
      </div>
      <div className="card">
        <h2 style={{ textAlign: "center" }}>Features</h2>
        <ul className="list">
          <li className="list li">Devanagari Transliteration</li>
          <li className="list li">Error Detection and Correction</li>
          <li className="list li">Next Word Prediction</li>
          <li className="list li">Part of Speech Recognition</li>
        </ul>
      </div>
      <Members />
    </div>
  );
};
export default About;
