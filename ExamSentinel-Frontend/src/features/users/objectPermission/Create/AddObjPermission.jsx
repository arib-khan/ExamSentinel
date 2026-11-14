// // // // import React from "react";
// // // // import useGetList from "../../userRole/list/useGetList";

// // // // function AddObjPermission() {
// // // //   const { data, loading, error, fetchData } = useGetList();
// // // //   // const { data, loading, error, fetchData } = useGetSystem();
// // // //   console.log(data);


// // // //   return <div>AddObjPermission</div>;
// // // // }

// // // // export default AddObjPermission;

// // // import React, { useEffect, useState } from "react";
// // // import useGetList from "../../userRole/list/useGetList"; // user roles
// // // import useGetSystem from "./useGetSystem"; // system objects
// // // import axios from "axios";

// // // function AddObjPermission() {
// // //   const { data: rolesData, loading: rolesLoading } = useGetList();
// // //   const { data: objectsData, loading: objectsLoading } = useGetSystem();

// // //   const [selectedRole, setSelectedRole] = useState("");
// // //   const [permissions, setPermissions] = useState({}); // {objectName: {create, read,...}}

// // //   useEffect(() => {
// // //     // Initialize permissions state when objectsData is loaded
// // //     if (objectsData) {
// // //       const initial = {};
// // //       objectsData.forEach((obj) => {
// // //         initial[obj.sys_object_name] = {
// // //           create: "N",
// // //           read: "N",
// // //           update: "N",
// // //           delete: "N",
// // //           execute: "N",
// // //         };
// // //       });
// // //       setPermissions(initial);
// // //     }
// // //   }, [objectsData]);

// // //   if (rolesLoading || objectsLoading) return <div>Loading...</div>;

// // //   const handleCheckboxChange = (objectName, perm) => {
// // //     setPermissions((prev) => ({
// // //       ...prev,
// // //       [objectName]: {
// // //         ...prev[objectName],
// // //         [perm]: prev[objectName][perm] === "Y" ? "N" : "Y",
// // //       },
// // //     }));
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (!selectedRole) {
// // //       alert("Please select a role");
// // //       return;
// // //     }

// // //     const payload = {
// // //       role_id: selectedRole,
// // //       objects: permissions,
// // //     };

// // //     try {
// // //       const res = await axios.post("/api/permissions/add", payload);
// // //       console.log(res.data);
// // //       alert("Permissions added successfully!");
// // //     } catch (err) {
// // //       console.error(err);
// // //       alert("Failed to add permissions");
// // //     }
// // //   };

// // //   return (
// // //     <div className="p-4">
// // //       <h2>Add Object Permissions</h2>

// // //       <div className="mb-4">
// // //         <label className="block mb-2">Select Role:</label>
// // //         <select
// // //           value={selectedRole}
// // //           onChange={(e) => setSelectedRole(e.target.value)}
// // //           className="border p-2 rounded"
// // //         >
// // //           <option value="">-- Select Role --</option>
// // //           {rolesData?.map((role) => (
// // //             <option key={role.user_role_id} value={role.user_role_id}>
// // //               {role.user_role_name}
// // //             </option>
// // //           ))}
// // //         </select>
// // //       </div>

// // //       <table className="table-auto border-collapse border border-gray-300 w-full">
// // //         <thead>
// // //           <tr>
// // //             <th className="border p-2">Object</th>
// // //             <th className="border p-2">Create</th>
// // //             <th className="border p-2">Read</th>
// // //             <th className="border p-2">Update</th>
// // //             <th className="border p-2">Delete</th>
// // //             <th className="border p-2">Execute</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {objectsData?.map((obj) => (
// // //             <tr key={obj.sys_object_id}>
// // //               <td className="border p-2">{obj.sys_object_display_name}</td>
// // //               {["create", "read", "update", "delete", "execute"].map((perm) => (
// // //                 <td key={perm} className="border p-2 text-center">
// // //                   <input
// // //                     type="checkbox"
// // //                     checked={permissions[obj.sys_object_name]?.[perm] === "Y"}
// // //                     onChange={() => handleCheckboxChange(obj.sys_object_name, perm)}
// // //                   />
// // //                 </td>
// // //               ))}
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>

// // //       <button
// // //         onClick={handleSubmit}
// // //         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
// // //       >
// // //         Submit
// // //       </button>
// // //     </div>
// // //   );
// // // }

// // // export default AddObjPermission;

// // import React, { useEffect, useState } from "react";
// // import useGetList from "../../userRole/list/useGetList"; // user roles
// // import useGetSystem from "./useGetSystem"; // system objects
// // import { Button } from "@/components/ui/button";
// // import { Check, X, Save } from "lucide-react";
// // import axios from "axios";
// // import { toast } from "sonner";

// // // Helper to format object names nicely
// // const formatLabel = (str) =>
// //   str
// //     .split("_")
// //     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
// //     .join(" ");

// // const AddObjPermission = () => {
// //   const { data: rolesData, loading: rolesLoading } = useGetList();
// //   const { data: objectsData, loading: objectsLoading } = useGetSystem();

// //   const [selectedRole, setSelectedRole] = useState("");
// //   const [permissions, setPermissions] = useState({}); // {objectName: {create, read,...}}

// //   const actions = ["create", "read", "update", "delete", "execute"];

// //   useEffect(() => {
// //     // Initialize permissions when objectsData loads
// //     if (objectsData) {
// //       const initial = {};
// //       objectsData.forEach((obj) => {
// //         initial[obj.sys_object_name] = {
// //           create: "N",
// //           read: "N",
// //           update: "N",
// //           delete: "N",
// //           execute: "N",
// //         };
// //       });
// //       setPermissions(initial);
// //     }
// //   }, [objectsData]);

// //   if (rolesLoading || objectsLoading) return <div>Loading...</div>;

// //   const handleToggle = (objectKey, actionKey) => {
// //     setPermissions((prev) => ({
// //       ...prev,
// //       [objectKey]: {
// //         ...prev[objectKey],
// //         [actionKey]: prev[objectKey][actionKey] === "Y" ? "N" : "Y",
// //       },
// //     }));
// //   };

// //   const handleSubmit = async () => {
// //     if (!selectedRole) {
// //       toast.error("Please select a role");
// //       return;
// //     }

// //     const payload = {
// //       role_id: selectedRole,
// //       objects: permissions,
// //     };

// //     try {
// //       const res = await axios.post("/api/permissions/add", payload);
// //       if (res.data.status) {
// //         toast.success("Permissions added successfully!");
// //       } else {
// //         toast.error(res.data.msg || "Failed to add permissions");
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to add permissions");
// //     }
// //   };

// //   return (
// //     <div className="p-4 space-y-6 max-w-4xl mx-auto">
// //       <h2 className="text-lg font-semibold">Add Object Permissions</h2>

// //       {/* Role Selection */}
// //       <div className="mb-4">
// //         <label className="block mb-2 font-medium">Select User Role</label>
// //         <select
// //           value={selectedRole}
// //           onChange={(e) => setSelectedRole(e.target.value)}
// //           className="border p-2 rounded w-full max-w-sm"
// //         >
// //           <option value="">Select User Role</option>
// //           {rolesData?.map((role) => (
// //             <option key={role.user_role_id} value={role.user_role_id}>
// //               {role.user_role_name}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       {/* Permission Matrix */}
// //       <div className="border rounded-md">
// //         {/* Header */}
// //         <div className="grid grid-cols-6 gap-4 bg-muted/50 p-4 font-medium border-b text-sm">
// //           <div className="col-span-1">Module Name</div>
// //           {actions.map((action) => (
// //             <div key={action} className="text-center capitalize text-xs sm:text-sm">
// //               {action}
// //             </div>
// //           ))}
// //         </div>

// //         {/* Rows */}
// //         <div className="divide-y">
// //           {objectsData?.map((obj) => (
// //             <div
// //               key={obj.sys_object_id}
// //               className="grid grid-cols-6 gap-2 p-4 items-center hover:bg-accent transition-colors"
// //             >
// //               <div className="col-span-1 font-medium text-sm">
// //                 {formatLabel(obj.sys_object_name)}
// //               </div>

// //               {actions.map((action) => (
// //                 <div key={action} className="flex justify-center">
// //                   <div
// //                     onClick={() => handleToggle(obj.sys_object_name, action)}
// //                     className={`
// //                       flex items-center justify-center w-8 h-8 rounded-md border transition-all
// //                       ${permissions[obj.sys_object_name]?.[action] === "Y"
// //                         ? "bg-primary border-primary text-primary-foreground"
// //                         : "bg-secondary border-secondary text-secondary-foreground"}
// //                       cursor-pointer hover:ring-2 ring-offset-1 ring-primary/20 shadow-sm
// //                     `}
// //                   >
// //                     {permissions[obj.sys_object_name]?.[action] === "Y" ? (
// //                       <Check className="w-5 h-5" />
// //                     ) : (
// //                       <X className="w-5 h-5" />
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Submit */}
// //       <div className="flex justify-end">
// //         <Button onClick={handleSubmit} className="gap-2">
// //           <Save className="w-4 h-4" />
// //           Save Permissions
// //         </Button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AddObjPermission;

// import React, { useEffect, useState } from "react";
// import useGetList from "../../userRole/list/useGetList"; // user roles
// import useGetSystem from "./useGetSystem"; // system objects
// import { Button } from "@/components/ui/button";
// import { Check, X, Save } from "lucide-react";
// import { toast } from "sonner";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { addSystemObject } from "@/services/PermissionServices/objectPermision";

// // Helper to format object names nicely
// const formatLabel = (str) =>
//   str
//     .split("_")
//     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(" ");

// const AddObjPermission = () => {
//   const { data: rolesData, loading: rolesLoading } = useGetList();
//   const { data: objectsData, loading: objectsLoading } = useGetSystem();

//   const [selectedRole, setSelectedRole] = useState("");
//   const [permissions, setPermissions] = useState({}); // {objectName: {create, read,...}}
//   const actions = ["create", "read", "update", "delete", "execute"];

//   useEffect(() => {
//     // Initialize permissions when objectsData loads
//     if (objectsData) {
//       const initial = {};
//       objectsData.forEach((obj) => {
//         initial[obj.sys_object_name] = {
//           create: "N",
//           read: "N",
//           update: "N",
//           delete: "N",
//           execute: "N",
//         };
//       });
//       setPermissions(initial);
//     }
//   }, [objectsData]);

//   if (rolesLoading || objectsLoading) return <div>Loading...</div>;

//   const handleToggle = (objectKey, actionKey) => {
//     setPermissions((prev) => ({
//       ...prev,
//       [objectKey]: {
//         ...prev[objectKey],
//         [actionKey]: prev[objectKey][actionKey] === "Y" ? "N" : "Y",
//       },
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!selectedRole) {
//       toast.error("Please select a role");
//       return;
//     }

//     const payload = {
//       role_id: selectedRole,
//       objects: permissions,
//     };

//     try {
//       const res = await addSystemObject(payload);
//       console.log(res);

//       if (res.data.status) {
//         toast.success("Permissions added successfully!");
//       } else {
//         toast.error(res.data.msg || "Failed to add permissions");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add permissions");
//     }
//   };

//   return (
//     <div className="p-4 space-y-6 max-w-4xl mx-auto bg-background rounded-md shadow-sm">
//       <h2 className="text-lg font-semibold">Add Object Permissions</h2>

//       {/* Role Selection using Select */}
//       <div className="mb-4">
//         <Label className="mb-1">Select User Role</Label>
//         <Select value={selectedRole} onValueChange={setSelectedRole}>
//           <SelectTrigger className="w-full max-w-sm">
//             <SelectValue placeholder="Select User Role" />
//           </SelectTrigger>
//           <SelectContent>
//             {rolesData?.map((role) => (
//               <SelectItem key={role.user_role_id} value={role.user_role_id}>
//                 {role.user_role_name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Permission Matrix */}
//       <div className="border rounded-md">
//         {/* Header */}
//         <div className="grid grid-cols-6 gap-4 bg-muted/50 p-4 font-medium border-b text-sm">
//           <div className="col-span-1">Module Name</div>
//           {actions.map((action) => (
//             <div
//               key={action}
//               className="text-center capitalize text-xs sm:text-sm"
//             >
//               {action}
//             </div>
//           ))}
//         </div>

//         {/* Rows */}
//         <div className="divide-y">
//           {objectsData?.map((obj) => (
//             <div
//               key={obj.sys_object_id}
//               className="grid grid-cols-6 gap-2 p-4 items-center hover:bg-accent transition-colors"
//             >
//               <div className="col-span-1 font-medium text-sm">
//                 {formatLabel(obj.sys_object_name)}
//               </div>

//               {actions.map((action) => (
//                 <div key={action} className="flex justify-center">
//                   <div
//                     onClick={() => handleToggle(obj.sys_object_name, action)}
//                     className={`flex items-center justify-center w-8 h-8 rounded-md border transition-all cursor-pointer hover:ring-2 ring-offset-1 ring-primary/20 shadow-sm ${permissions[obj.sys_object_name]?.[action] === "Y"
//                       ? "bg-primary border-primary text-primary-foreground"
//                       : "bg-secondary border-secondary text-secondary-foreground"
//                       }`}
//                   >
//                     {permissions[obj.sys_object_name]?.[action] === "Y" ? (
//                       <Check className="w-5 h-5" />
//                     ) : (
//                       <X className="w-5 h-5" />
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Submit */}
//       <div className="flex justify-end">
//         <Button onClick={handleSubmit} className="gap-2">
//           <Save className="w-4 h-4" />
//           Save Permissions
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AddObjPermission;

import React, { useEffect, useState } from "react";
import useGetList from "../../userRole/list/useGetList"; // user roles
import useGetSystem from "./useGetSystem"; // system objects
import { Button } from "@/components/ui/button";
import { Check, X, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addSystemObject } from "@/services/PermissionServices/objectPermision";

// Helper to format object names nicely
const formatLabel = (str) =>
  str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const AddObjPermission = () => {
  const { data: rolesData, loading: rolesLoading } = useGetList();
  const { data: objectsData, loading: objectsLoading } = useGetSystem();

  const [selectedRole, setSelectedRole] = useState("");
  const [permissions, setPermissions] = useState({}); // {objectName: {create, read,...}}
  const actions = ["create", "read", "update", "delete", "execute"];

  useEffect(() => {
    // Initialize permissions when objectsData loads
    if (objectsData) {
      const initial = {};
      objectsData.forEach((obj) => {
        initial[obj.sys_object_name] = {
          create: "N",
          read: "N",
          update: "N",
          delete: "N",
          execute: "N",
        };
      });
      setPermissions(initial);
    }
  }, [objectsData]);

  if (rolesLoading || objectsLoading) return <div>Loading...</div>;

  const handleToggle = (objectKey, actionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [objectKey]: {
        ...prev[objectKey],
        [actionKey]: prev[objectKey][actionKey] === "Y" ? "N" : "Y",
      },
    }));
  };

  const handleRemove = (objectKey) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      delete updated[objectKey]; // remove the module
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (Object.keys(permissions).length === 0) {
      toast.error("Please add at least one module permission");
      return;
    }

    const payload = {
      role_id: selectedRole,
      objects: permissions,
    };

    try {
      const res = await addSystemObject(payload);
      console.log(res);

      if (res.data.status) {
        toast.success("Permissions added successfully!");
      } else {
        toast.error(res.data.msg || "Failed to add permissions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add permissions");
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto bg-background rounded-md shadow-sm">
      <h2 className="text-lg font-semibold">Add Object Permissions</h2>

      {/* Role Selection using Select */}
      <div className="mb-4">
        <Label className="mb-1">Select User Role</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Select User Role" />
          </SelectTrigger>
          <SelectContent>
            {rolesData?.map((role) => (
              <SelectItem key={role.user_role_id} value={role.user_role_id}>
                {role.user_role_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Permission Matrix */}
      <div className="border rounded-md">
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 bg-muted/50 p-4 font-medium border-b text-sm">
          <div className="col-span-1">Module Name</div>
          {actions.map((action) => (
            <div
              key={action}
              className="text-center capitalize text-xs sm:text-sm"
            >
              {action}
            </div>
          ))}
          <div className="text-center">Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {Object.keys(permissions).map((objectKey) => (
            <div
              key={objectKey}
              className="grid grid-cols-7 gap-2 p-4 items-center hover:bg-accent transition-colors"
            >
              <div className="col-span-1 font-medium text-sm">
                {formatLabel(objectKey)}
              </div>

              {actions.map((action) => (
                <div key={action} className="flex justify-center">
                  <div
                    onClick={() => handleToggle(objectKey, action)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md border transition-all cursor-pointer hover:ring-2 ring-offset-1 ring-primary/20 shadow-sm ${permissions[objectKey]?.[action] === "Y"
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-secondary border-secondary text-secondary-foreground"
                      }`}
                  >
                    {permissions[objectKey]?.[action] === "Y" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </div>
                </div>
              ))}

              {/* Remove button */}
              <div className="flex justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(objectKey)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="gap-2">
          <Save className="w-4 h-4" />
          Save Permissions
        </Button>
      </div>
    </div>
  );
};

export default AddObjPermission;
