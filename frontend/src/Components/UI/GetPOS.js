import styles from "./Button.module.css";

const GetPOS = (props)=>{
    return (
        <button className={styles.btn} type={props.type || "button"} onClick={props.onClick}>
          {props.children}
        </button>
      );
};

export default GetPOS