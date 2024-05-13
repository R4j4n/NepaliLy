import styles from "./Button.module.css";

const More = (props)=>{
    const sendSentenceHandler = (event)=>{
      console.log('item sent for pos' ,props.sentence);
        event.preventDefault();
        props.onClick(props.sentence);
    }
    return (
        <button className={styles.btn} type={props.type || "button"} onClick={sendSentenceHandler}>
          {props.children}
        </button>
      );
};

export default More;