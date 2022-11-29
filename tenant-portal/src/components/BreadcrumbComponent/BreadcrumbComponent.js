import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";

const BreadcrumbComponent = () => {
    const breadcrumbs = useBreadcrumbs();
  return (
    <div className="d-flex flex-wrap ms-4">
      {breadcrumbs.map(({ breadcrumb, match }, index) => (
        <div className="breadcrumb" key={match.pathname}> 
            <a href={match.pathname}
             className={(index==breadcrumbs.length-1)?
              'breadcrumb-item disabled':'breadcrumb-item'}>{breadcrumb}</a>
            {index < breadcrumbs.length - 1 && "/"}
        </div>
      ))}
    </div>
  )
}

export default BreadcrumbComponent