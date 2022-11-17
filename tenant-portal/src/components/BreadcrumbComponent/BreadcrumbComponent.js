import React from "react";
import { Link } from "react-router-dom";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import config from "../../config.json";
const BreadcrumbComponent = () => {
    const breadcrumbs = useBreadcrumbs();
  return (
    <div className="d-flex">
      {breadcrumbs.map(({ breadcrumb, match }, index) => (
        <div className="bc" key={match.url}>
          <Link to={config.urlPath+"/"+match.url || config.urlPath}>{breadcrumb}</Link>
          {index < breadcrumbs.length - 1 && "/"}
        </div>
      ))}
    </div>
  )
}

export default BreadcrumbComponent