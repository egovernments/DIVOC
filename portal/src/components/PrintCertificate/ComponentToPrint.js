import React from "react";
import QRCode from 'qrcode.react';
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
                    {/* <td align={"right"}> <QRCode size={128} value={JSON.stringify(this.props.dataToPrint.certificate)} /></td> */}
                </tr>
                </tbody>
            </table>
        </div>
      );
    }
  }