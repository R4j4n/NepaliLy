import React from "react";
import MemberItem from "./MemberItem";
import { Fragment } from "react/cjs/react.production.min";

const Members = (props) => {
  const projectMembers = [
    {
      image: require("./images/rajan1.jpeg"),
      role: "Natural Language Processing and Data Engineering",
      name: "Rajan Ghimire",
      mail: "rjnghimire@outlook.com",
      github: "https://github.com/R4j4n",
      linkedIn: "https://www.linkedin.com/in/rajan-ghimire-052987205/",
      description:
        "Self-driven machine learning enthusiast, passionate about cutting-edge technology and developing machine learning systems. Possessing attention to detail and strong analytical thinking skills.",
    },
    {
      image: require("./images/rahul.jpg"),
      role: "Full Stack Developer",
      name: "Raul Shahi",
      mail: "rahulfromnepal2013@gmail.com",
      github: "https://github.com/RaulShahi",
      linkedIn: "https://www.linkedin.com/in/raul-shahi-71627a226/",
      description:
        "A competent and enthusiastic Computer Engineering Student aspiring to become a capable full stack developer, has good command over languages such as Python and mainly JavaScript(REACT, Node).",
    },
    {
      image: require("./images/rikesh.jpg"),
      role: "Backend Developer",
      name: "Rikesh Basnet",
      mail: "rikesbasnet@outlook.com",
      github: "https://github.com/basnetrikesh",
      linkedIn: "https://www.linkedin.com/in/rikesh-basnet-0152a9186/",
      description:
        "Versatile, Analytical, and Hardworking programmer having an interest in Game Development, Android app development, and Machine Learning.",
    },
    {
      image: require("./images/Sarinaa.jpg"),
      role: "Design and Research",
      name: "Sarina Joshi",
      mail: "josheesarina@gmail.com",
      github: "https://github.com/Sarina-Joshi",
      linkedIn: "https://www.linkedin.com/in/sarina-joshi-27790a1aa/",
      description:
        "A diligent learner who believes in the power of learning with compassion. She is inclined towards the jouney of front end web development and aspires to become a front end developer.",
    },
  ];
  return (
    <Fragment>
      <h2 style={{textAlign:'center'}}>Meet The Members</h2>
    <div style={memberStyle}>
      {projectMembers.map((item) => {
        return <MemberItem key={Math.random()} member={item} />;
      })}
    </div>
    </Fragment>
  );
};

const memberStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gridGap: "1rem",
};
export default Members;
