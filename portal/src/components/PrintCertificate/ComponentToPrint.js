import React from "react";
import styles from "./PrintCertificate.module.css";

export default class ComponentToPrint extends React.Component {
    render() {
        console.log("data",this.props.dataToPrint)
      return (
        <div className='print-source'>
          <table borderless className={styles["certificate"]}>
                <tbody>
                <tr>C-19 Vaccination Receipt</tr>
                <tr>
                    <td>Recipient’s details:</td>
                    <td>Name: {this.props.dataToPrint.name}</td>
                </tr>
                <tr>
                </tr>
                </tbody>
            </table>
        </div>
      );
    }
  }