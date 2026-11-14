// // import { Link } from "react-router-dom";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";

// // export default function NotFound() {
// //   return (
// //     <div className="flex items-center justify-center min-h-screen bg-background px-4">
// //       <Card className="max-w-md w-full text-center shadow-lg p-6">
// //         <CardContent className="flex flex-col items-center gap-4">
// //           <h1 className="text-5xl font-bold text-destructive">404</h1>
// //           <p className="text-muted-foreground text-lg">
// //             Oops! The page you are looking for doesn't exist.
// //           </p>
// //           <Button asChild>
// //             <Link to="/admin/dashboard">Go to Dashboard</Link>
// //           </Button>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }


import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/contexts/PermissionContext";

export default function NotFound() {
  const { userRole } = usePermissions();
  console.log(userRole);


  const getDashboardPath = () => {
    switch (userRole) {
      case 1:
        return "/admin/dashboard";
      case 2:
        return "/client/dashboard";
      case 3:
        return "/class-invigilator/dashboard";
      default:
        return "/login";
    }
  };

  const buttonLabel = userRole ? "Go to Dashboard" : "Go to Login";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="max-w-md w-full text-center shadow-lg p-6">
        <CardContent className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold text-destructive">404</h1>
          <p className="text-muted-foreground text-lg">
            Oops! The page you are looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to={getDashboardPath()}>{buttonLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
