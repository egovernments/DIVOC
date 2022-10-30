import { Link } from 'react-router-dom'
import useBreadcrumbs from 'use-react-router-breadcrumbs'
const routes = [
  { path: '/create-schema', breadcrumb: 'create-schema' },
  
];
function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs(routes);
  console.log(breadcrumbs)
  return (
    <nav>
      {breadcrumbs.map(({ match, breadcrumb }) => (
        <Link key={match.url} to={match.url}>
          {breadcrumb} /
        </Link>
      ))}
    </nav>
  );
}
export default Breadcrumbs;