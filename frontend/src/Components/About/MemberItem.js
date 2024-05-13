import { useState } from "react";

const MemberItem = (props) => {
  
  return (
    <div className="card text-center">
      <img
        src={props.member.image}
        className="round-img"
        style={{
          width: "80px",
        }}
      />
      <h3>{props.member.name}</h3>
      <h5>{props.member.role}</h5>
      <p>{props.member.description}</p>
      <div>
          <a href={"mailto:"+ props.member.mail} style={{margin:'1rem'}}><i className="fa-solid fa-envelope"></i></a>
          <a href={props.member.github} style={{margin:'1rem'}}><i class="fa-brands fa-github"></i></a>
          <a href={props.member.linkedIn} style={{margin:'1rem'}}><i class="fa-brands fa-linkedin"></i></a>
      </div>
    </div>
  );
};
export default MemberItem;
