import React from "react";
import styles from "./index.module.css";

export const TotalRecords = ({title, count}) => (
    <div className={styles["container"] + " justify-content-between align-items-center"}>
        <span className="font-weight-bold" style={{whiteSpace: "pre-wrap"}}>{title}</span>
        <span className="font-weight-bold" style={{fontSize: "30px", color: '#88C6A9'}}>{count}</span>
    </div>
);
