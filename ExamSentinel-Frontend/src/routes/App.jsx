// routes/AppRoutes.jsx
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";

const AppRoutes = [...PublicRoutes, ...AdminRoutes];

export default AppRoutes;
