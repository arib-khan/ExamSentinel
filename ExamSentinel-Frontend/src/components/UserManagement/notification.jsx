// import { Card, CardContent } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { useEffect } from "react";
// import { notificationList } from "@/services/NotificationServices/Notification";

// const notifications = [
//   {
//     id: 1,
//     title: "New Comment",
//     message: "Alex commented on your post.",
//     time: "2 min ago",
//     type: "comment",
//     avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//   },
//   {
//     id: 2,
//     title: "New Follower",
//     message: "Maria started following you.",
//     time: "10 min ago",
//     type: "follow",
//     avatar: "https://randomuser.me/api/portraits/women/2.jpg",
//   },
//   {
//     id: 3,
//     title: "System Alert",
//     message: "Server backup completed successfully.",
//     time: "1 hr ago",
//     type: "system",
//     avatar: "",
//   },

//   // ... more notifications
// ];

// useEffect(async () => {
//   // Fetch notifications from API when component mounts
//   const response = await notificationList(user_id, role_id);
//   console.log(response.data);
// }, []);

// const NotificationList = () => {
//   return (
//     <div className="grid gap-4 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//       {notifications.map((note) => (
//         <Card key={note.id} className="flex items-start gap-4 p-4">
//           <Avatar className="h-10 w-10 shrink-0">
//             <AvatarImage src={note.avatar} />
//             <AvatarFallback>{note.title.charAt(0)}</AvatarFallback>
//           </Avatar>
//           <CardContent className="p-0 w-full">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
//               <div>
//                 <h4 className="font-semibold text-base">{note.title}</h4>
//                 <p className="text-sm text-muted-foreground">{note.message}</p>
//               </div>
//               <Badge
//                 variant="secondary"
//                 className="text-xs self-start sm:self-center"
//               >
//                 {note.type}
//               </Badge>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">{note.time}</p>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// };

// export default NotificationList;

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { notificationList } from "@/services/NotificationServices/Notification";
import { NoDataFound } from "../reusableComponets/NoDataFound";
import { BellDot } from "lucide-react";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const user_id = "Classinvigilator@sysassist.com"; // or from context
  const role_id = 2;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationList(user_id, role_id);
        setNotifications(data.data || []); // assuming backend returns { data: [...] }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, [user_id, role_id]);

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {notifications.length > 0 ? (
        notifications.map((note) => (
          <Card key={note.id} className="flex items-start gap-4 p-4">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage
                src={note.triggered_by_avatar || "https://via.placeholder.com/40"}
              />
              <AvatarFallback>
                {note.title?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardContent className="p-0 w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <div>
                  <h4 className="font-semibold text-base">{note.title}</h4>
                  <p className="text-sm text-muted-foreground">{note.message}</p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs self-start sm:self-center"
                >
                  {note.type || "info"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(note.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        // <p className="text-center text-gray-500 col-span-full">
        //   No notifications available.
        // </p>
        <div className="col-span-full flex justify-center">
          <NoDataFound
            title="No Notifications"
            description="You have no notifications at the moment."
            icon={BellDot}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationList;
