import React from "react";
import QRCode from "qrcode.react";
import styles from "./PrintCertificate.module.css";
import logo from "../../assets/img/nav-logo.png";

export default class CustomPrint extends React.PureComponent {
    render() {
      return (
        <div className={styles['certificate-container']}>
         {this.props.dataToPrint.map((certificate) => {
                return (
                    <table className={`${styles['table-wrapper']} ${styles["certificate"]}`}>
                        <tbody>
                            <tr>
                                <td className={styles['heading']}>C-19 Vaccination  {this.props.title}</td>
                            </tr>
                            <tr>
                                <td><b>Receipt ID:</b>{certificate.receiptId}</td>
                            </tr>
                            <tr>
                                <td><b>DATE:</b>2020-12-10</td>
                                <td><b>TIME:</b></td>
                            </tr>
                            <tr>
                                <td><b>Centre of Vaccination:</b> </td> 
                            </tr>
                            <tr>
                                <td>
                                    <b>Date of Vaccination:</b>
                                    {certificate.date.substring(0, 10)}
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Certificate ID:</b> {certificate.certificateId}
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Recipient’s details:</b></td>
                            </tr>
                            <tr><td><b>Name:</b> {certificate.name}</td></tr>
                            <tr><td><b>Gender:</b> {certificate.gender}</td></tr>
                            <tr>
                                <td>
                                    <img src={logo} width="150"/>
                                </td>
                                <td align={"right"}> <QRCode size={128} value={JSON.stringify(certificate.certificate)} /></td>
                            </tr>
                        </tbody>
                    </table>
                );
            })}
        </div>
      );
    }
  }