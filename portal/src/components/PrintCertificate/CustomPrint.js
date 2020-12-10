import React from "react";
import QRCode from "qrcode.react";
import styles from "./PrintCertificate.module.css";
import logo from "../../assets/img/nav-logo.png";

export default class CustomPrint extends React.PureComponent {
    render() {
      return (
        <div>
         {this.props.dataToPrint.map((certificate) => {
                return (
                    <table className={`${styles['table-wrapper']} ${styles["certificate"]}`}>
                        <tbody>
                            <tr>
                                <td className={styles['heading']}>C-19 Vaccination Receipt</td>
                            </tr>
                            <tr>
                                <td>Receipt ID:</td>
                            </tr>
                            <tr>
                                <td>DATE: </td>
                                <td>TIME: </td>
                            </tr>
                            <tr>
                                <td>Centre of Vaccination:</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    Date of Vaccination:{" "}
                                    {certificate.date.substring(0, 10)}
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    Certificate ID: {certificate.certificateId}
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Recipient’s details:</td>
                            </tr>
                            <tr><td>Name: {certificate.name}</td></tr>
                                
                                <tr><td>Gender: {certificate.gender}</td>
                            </tr>
                            <tr>
                                <td>
                                    <img src={logo} width="150"/>
                                </td>
                                <td>
                                    <td align={"right"}> <QRCode size={128} value={JSON.stringify(certificate.certificate)} /></td>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                );
            })}
        </div>
      );
    }
  }