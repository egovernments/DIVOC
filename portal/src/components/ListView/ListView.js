import React from 'react';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import styles from './ListView.module.css';

function ListView({ listData }) {
    const colors = ['#F2FAF6', '#FFF9EB', '#F7F8FF', '#EFF9FF']

    return(
        <div>
            {
                listData.map( data => {
                    // console.log(data)
                    var random_color = colors[Math.floor( Math.random() * colors.length)]; 
                    return (
                       
                    <div className={styles['card-container']} style={{backgroundColor: random_color}}>
                        <div className={styles['card-details']}>
                            <div className={styles['name']}>{data.name}</div>
                            <div className={styles['details']}>{data.provider}</div>
                        </div>
                        <div>
                            More Details
                            <ArrowForwardIcon/>
                        </div>
                    </div>
                    )
                })
            }
        </div>
           
    );
}

export default ListView;