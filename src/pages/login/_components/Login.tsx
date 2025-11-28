import { PUBLIC_ROUTES, ROUTES } from "../../../routes/url.constants";
import { isSessionExpired } from "../../../utils/helper/token";

import DesktopLogin from "./DesktopLogin";

const Login = () => {
  const isTokensExpired = isSessionExpired();
  const isPublicPath = PUBLIC_ROUTES.includes(window.location.pathname);

  if (isPublicPath && !isTokensExpired) {
    window.location.href = `${ROUTES.DASHBOARD}`;
    return;
  }

  return <DesktopLogin />;
};

export default Login;
