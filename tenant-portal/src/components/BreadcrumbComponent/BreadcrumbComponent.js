import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import HelpIcon from "../../assets/img/Help.svg";
import { Link, useLocation } from "react-router-dom";
const BreadcrumbComponent = ({showBreadCrumb}) => {
  const location = useLocation();
  var show;
  show = showBreadCrumb ? showBreadCrumb : (!showBreadCrumb && (location.pathname!=='/manage-schema'));
  const breadcrumbs = useBreadcrumbs();
  return (
    <div className={`d-flex flex-wrap ms-4 ${show? '':'d-none'}`}>
      {breadcrumbs.map(({ breadcrumb, match }, index) => (
        <div className={(breadcrumbs.length==1)? "d-none" :"breadcrumb"} key={match.pathname}> 
            <a href={match.pathname}
             className={`breadcrumb-item text-capitalize 
             ${(index==breadcrumbs.length-1) ? 'disabled':''}`}>{breadcrumb}</a>
            {index < breadcrumbs.length - 1 && "/"}
        </div>
      ))}
      <Link to="#" className="ms-auto me-3 text-decoration-none">Help{" "}<img src={HelpIcon} /></Link>
    </div>
  )
}

export default BreadcrumbComponent