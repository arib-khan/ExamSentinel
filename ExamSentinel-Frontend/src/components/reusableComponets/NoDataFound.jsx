// import React from "react";
// import { Button } from "@/components/ui/button";
// import {
//     Empty,
//     EmptyContent,
//     EmptyDescription,
//     EmptyHeader,
//     EmptyMedia,
//     EmptyTitle,
// } from "@/components/ui/empty";

// export function NoDataFound({
//     title = "No Data Found",
//     description = "There is nothing to display here.",
//     icon: Icon = CircleQuestionMark,
//     buttonText,
//     buttonAction,
// }) {
//     return (
//         <Empty className="h-full flex flex-col justify-center items-center">
//             <EmptyHeader>
//                 <EmptyMedia variant="icon">
//                     <Icon className="w-12 h-12 text-gray-400" />
//                 </EmptyMedia>
//                 <EmptyTitle>{title}</EmptyTitle>
//                 <EmptyDescription>{description}</EmptyDescription>
//             </EmptyHeader>
//             {buttonText && buttonAction && (
//                 <EmptyContent>
//                     <Button variant="outline" size="sm" onClick={buttonAction}>
//                         {buttonText}
//                     </Button>
//                 </EmptyContent>
//             )}
//         </Empty>
//     );
// }

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

// 👉 Default Lucide Icon
import { CircleHelp } from "lucide-react"; // or any icon you want

export function NoDataFound({
    title = "No Data Found",
    description = "There is nothing to display here.",
    icon: Icon = CircleHelp,   // <-- Default Icon
    buttonText,
    buttonAction,
}) {
    return (
        <Empty className="h-full flex flex-col justify-center items-center ">
            <EmptyHeader className="bg-background p-4 rounded-lg">
                <EmptyMedia variant="icon">
                    <Icon className="w-12 h-12 text-gray-400" />
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
            </EmptyHeader>

            {buttonText && buttonAction && (
                <EmptyContent>
                    <Button variant="outline" size="sm" onClick={buttonAction}>
                        {buttonText}
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
}
