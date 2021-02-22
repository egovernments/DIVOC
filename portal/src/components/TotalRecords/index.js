import React from "react";
import styles from "./index.module.css";

export const TotalRecords = ({title, count}) => (
    <div className={styles["container"]}>
        <span className="font-weight-bolder" style={{color: '#88C6A9'}}>{count}</span>
        <span className="font-weight-bold" style={{whiteSpace: "no-wrap"}}>&emsp;{title}</span>
    </div>
);
