
// import React, { useState, useMemo } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { AlertCircle, Users, Search } from "lucide-react";
// import useGetSeatList from "./useGetSeatList";
// import { updateStudentSeat } from "@/services/StudentServices/studentService";

// export default function SeatAllocation({ open, onClose, student, onVerified }) {
//     const { data: seats, loading, error, refetch } = useGetSeatList();
//     const [selectedSeat, setSelectedSeat] = useState(null);
//     const [searchQuery, setSearchQuery] = useState("");



//     const hasFingerprint = !!student?.capture;
//     const hasSeat = student?.iecsm_seat_num != null;
//     const isDisabled = student?.is_disabled === "Y";


//     // const processedSeats = useMemo(() => {
//     //     if (!seats) return [];

//     //     // Filter only available seats first
//     //     let availableSeats = seats.filter(seat => seat.center_is_available === "Y");

//     //     // ✅ PWD Students → Only Floor 1 seats
//     //     if (isDisabled) {
//     //         availableSeats = availableSeats.filter(
//     //             seat => seat.center_floor_number === 1
//     //         );
//     //     } else {
//     //         // ✅ Non-PWD Students
//     //         const nonFloor1Seats = availableSeats.filter(
//     //             seat => seat.center_floor_number !== 1
//     //         );

//     //         // If other floors have available seats, prefer them
//     //         if (nonFloor1Seats.length > 0) {
//     //             availableSeats = nonFloor1Seats;
//     //         }
//     //         // else → if only floor 1 seats remain, show them as fallback
//     //     }

//     //     // ✅ Sort the filtered list
//     //     const sortedSeats = [...availableSeats].sort((a, b) => {
//     //         if (isDisabled) {
//     //             // Prioritize Block A for disabled students
//     //             if (a.center_block === "A" && b.center_block !== "A") return -1;
//     //             if (a.center_block !== "A" && b.center_block === "A") return 1;
//     //             if (a.center_block === "A" && b.center_block === "A") {
//     //                 if (a.center_room < b.center_room) return -1;
//     //                 if (a.center_room > b.center_room) return 1;
//     //             }
//     //         }

//     //         if (a.center_block !== b.center_block) return a.center_block.localeCompare(b.center_block);
//     //         if (a.center_hall !== b.center_hall) return a.center_hall.localeCompare(b.center_hall);
//     //         if (a.center_room !== b.center_room) return a.center_room.localeCompare(b.center_room);
//     //         if (a.center_row !== b.center_row) return a.center_row.localeCompare(b.center_row);
//     //         return a.center_seat_number.localeCompare(b.center_seat_number);
//     //     });

//     //     return sortedSeats;
//     // }, [seats, isDisabled]);


//     // const processedSeats = useMemo(() => {
//     //     if (!seats) return [];

//     //     // ✅ Case 1: Student already has a seat assigned
//     //     if (student?.iecsm_seat_num) {
//     //         const assignedSeat = seats.find(
//     //             seat => seat.center_seat_id === student.iecsm_seat_num
//     //         );
//     //         return assignedSeat ? [assignedSeat] : [];
//     //     }

//     //     // ✅ Case 2: Student does not have a seat yet
//     //     let availableSeats = seats.filter(seat => seat.center_is_available === "Y");

//     //     // ✅ PWD Students → Only Floor 1 seats
//     //     if (isDisabled) {
//     //         availableSeats = availableSeats.filter(
//     //             seat => seat.center_floor_number === 1
//     //         );
//     //     } else {
//     //         // ✅ Non-PWD Students
//     //         const nonFloor1Seats = availableSeats.filter(
//     //             seat => seat.center_floor_number !== 1
//     //         );

//     //         // If other floors have available seats, prefer them
//     //         if (nonFloor1Seats.length > 0) {
//     //             availableSeats = nonFloor1Seats;
//     //         }
//     //         // else → if only floor 1 seats remain, show them as fallback
//     //     }

//     //     // ✅ Sort the filtered list
//     //     const sortedSeats = [...availableSeats].sort((a, b) => {
//     //         if (isDisabled) {
//     //             // Prioritize Block A for disabled students
//     //             if (a.center_block === "A" && b.center_block !== "A") return -1;
//     //             if (a.center_block !== "A" && b.center_block === "A") return 1;
//     //             if (a.center_block === "A" && b.center_block === "A") {
//     //                 if (a.center_room < b.center_room) return -1;
//     //                 if (a.center_room > b.center_room) return 1;
//     //             }
//     //         }

//     //         if (a.center_block !== b.center_block) return a.center_block.localeCompare(b.center_block);
//     //         if (a.center_hall !== b.center_hall) return a.center_hall.localeCompare(b.center_hall);
//     //         if (a.center_room !== b.center_room) return a.center_room.localeCompare(b.center_room);
//     //         if (a.center_row !== b.center_row) return a.center_row.localeCompare(b.center_row);
//     //         return a.center_seat_number.localeCompare(b.center_seat_number);
//     //     });

//     //     return sortedSeats;
//     // }, [seats, isDisabled, student?.iecsm_seat_num]);

//     const processedSeats = useMemo(() => {
//         if (!seats) return [];

//         // ✅ Case 1: Student already has a seat assigned
//         if (hasSeat) {
//             const assignedSeat = seats.find(seat => seat.center_seat_id === student.iecsm_seat_num);
//             return assignedSeat ? [assignedSeat] : [];
//         }

//         // ✅ Case 2: Student does not have a seat yet
//         let availableSeats = seats.filter(seat => seat.center_is_available === "Y");

//         if (isDisabled) {
//             availableSeats = availableSeats.filter(seat => seat.center_floor_number === 1);
//         } else {
//             const nonFloor1Seats = availableSeats.filter(seat => seat.center_floor_number !== 1);
//             if (nonFloor1Seats.length > 0) availableSeats = nonFloor1Seats;
//         }

//         return availableSeats.sort((a, b) => {
//             if (isDisabled) {
//                 if (a.center_block === "A" && b.center_block !== "A") return -1;
//                 if (a.center_block !== "A" && b.center_block === "A") return 1;
//                 if (a.center_block === "A" && b.center_block === "A") {
//                     return a.center_room - b.center_room;
//                 }
//             }
//             if (a.center_block !== b.center_block) return a.center_block.localeCompare(b.center_block);
//             if (a.center_hall !== b.center_hall) return a.center_hall.localeCompare(b.center_hall);
//             if (a.center_room !== b.center_room) return a.center_room.localeCompare(b.center_room);
//             if (a.center_row !== b.center_row) return a.center_row.localeCompare(b.center_row);
//             return a.center_seat_number.localeCompare(b.center_seat_number);
//         });
//     }, [seats, isDisabled, hasSeat, student?.iecsm_seat_num]);


//     const filteredSeats = useMemo(() => {
//         if (!searchQuery.trim()) return processedSeats;
//         const query = searchQuery.toLowerCase();

//         return processedSeats.filter(seat =>
//             seat.center_block.toLowerCase().includes(query) ||
//             seat.center_hall.toLowerCase().includes(query) ||
//             seat.center_room.toLowerCase().includes(query) ||
//             seat.center_row.toLowerCase().includes(query) ||
//             seat.center_seat_number.toLowerCase().includes(query) ||
//             seat.center_seat_remark?.toLowerCase().includes(query) ||
//             seat.center_seat_label.toLowerCase().includes(query)
//         );
//     }, [processedSeats, searchQuery]);

//     const submitSeat = async () => {
//         if (!selectedSeat) return;
//         try {
//             const payload = { iecsm_seat_num: selectedSeat.center_seat_id };
//             const response = await updateStudentSeat(student?.id, payload);

//             if (response.data.status) {
//                 toast.success(response.data.msg || "Seat allocated successfully!");
//                 onVerified(student, selectedSeat);
//                 refetch(); // refresh seat list
//                 onClose();
//             } else {
//                 toast.error(response.data.msg || "Failed to allocate seat");
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error("Failed to allocate seat");
//         }
//     };

//     if (!student || !hasFingerprint) return null;

//     return (
//         <Dialog open={open} onOpenChange={onClose}>
//             {/* ✅ Bigger width + scrollable height */}
//             <DialogContent className="max-w-6xl w-full">
//                 <div className="max-h-[80vh] overflow-y-auto space-y-4">
//                     <DialogHeader>
//                         <DialogTitle className="text-xl font-semibold flex items-center gap-2">
//                             Seat Allocation
//                             {isDisabled && (
//                                 <span className="flex items-center gap-1 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
//                                     <Users className="w-4 h-4" />
//                                     Priority Access
//                                 </span>
//                             )}
//                         </DialogTitle>
//                     </DialogHeader>

//                     {/* Student Info */}
//                     <div className="bg-gray-50 p-3 rounded-lg">
//                         <p className="text-sm font-medium text-gray-700">
//                             {student.name} ({student.roll_number})
//                         </p>
//                     </div>

//                     {/* Priority Notice */}
//                     {/* {isDisabled && processedSeats.some(s => s.center_block === "A") && (
//                         <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-lg">
//                             <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                             <div className="text-sm text-blue-800">
//                                 <p className="font-medium">Priority Seating Available</p>
//                                 <p className="text-blue-700">Block A seats are recommended for easier accessibility</p>
//                             </div>
//                         </div>
//                     )} */}

//                     {/* Global Search */}
//                     <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <Input
//                             type="text"
//                             placeholder="Search by block, hall, room, row, seat number, or remarks..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="pl-10"
//                         />
//                         {searchQuery && (
//                             <button
//                                 onClick={() => setSearchQuery("")}
//                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                             >
//                                 ✕
//                             </button>
//                         )}
//                     </div>

//                     {/* Search Results Count */}
//                     {searchQuery && (
//                         <p className="text-sm text-gray-600">
//                             Found {filteredSeats.length} seat{filteredSeats.length !== 1 ? "s" : ""}
//                         </p>
//                     )}

//                     {/* Loading/Error */}
//                     {loading && <p className="text-center py-8 text-gray-500">Loading available seats...</p>}
//                     {error && (
//                         <div className="text-center py-8">
//                             <p className="text-red-500 mb-2">Failed to load seats</p>
//                             <Button onClick={refetch} variant="outline" size="sm">
//                                 Retry
//                             </Button>
//                         </div>
//                     )}

//                     {/* Table */}
//                     {!loading && !error && (
//                         <>
//                             {filteredSeats.length > 0 ? (
//                                 <div className="border rounded-lg overflow-hidden">
//                                     <div className="max-h-96 overflow-y-auto overflow-x-auto">
//                                         <table className="min-w-full">
//                                             <thead className="bg-gray-50 sticky top-0">
//                                                 <tr className="border-b">
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Block
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Floor
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Hall
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Room
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Row
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Seat
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Remarks
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Seat Lable
//                                                     </th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                                         Status
//                                                     </th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="bg-white divide-y divide-gray-200">
//                                                 {filteredSeats.map((seat) => {
//                                                     const isSelected = selectedSeat?.center_seat_id === seat.center_seat_id;
//                                                     const isPriority = isDisabled && seat.center_block === "A";

//                                                     return (
//                                                         <tr
//                                                             key={seat.center_seat_id}
//                                                             onClick={() => setSelectedSeat(seat)}
//                                                             className={`
//                                 cursor-pointer transition-colors
//                                 ${isSelected
//                                                                     ? "bg-blue-100 hover:bg-blue-100"
//                                                                     : isPriority
//                                                                         ? "bg-green-50 hover:bg-green-100"
//                                                                         : "hover:bg-gray-50"
//                                                                 }
//                               `}
//                                                         >
//                                                             <td className="px-4 py-3 whitespace-nowrap">
//                                                                 <div className="flex items-center gap-2">
//                                                                     <span className={`font-semibold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
//                                                                         {seat.center_block}
//                                                                     </span>
//                                                                     {isPriority && (
//                                                                         <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
//                                                                             Priority
//                                                                         </span>
//                                                                     )}
//                                                                 </div>
//                                                             </td>
//                                                             <td className={`px-4 py-3 text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
//                                                                 {seat.center_floor_number}
//                                                             </td>
//                                                             <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
//                                                                 {seat.center_hall}
//                                                             </td>
//                                                             <td className={`px-4 py-3 text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
//                                                                 {seat.center_room}
//                                                             </td>
//                                                             <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
//                                                                 {seat.center_row}
//                                                             </td>
//                                                             <td className={`px-4 py-3 text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
//                                                                 {seat.center_seat_number}
//                                                             </td>
//                                                             <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-800" : "text-gray-600"}`}>
//                                                                 {seat.center_seat_remark || "-"}
//                                                             </td>
//                                                             <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-800" : "text-gray-600"}`}>
//                                                                 {seat.center_seat_label || "-"}
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 {isSelected ? (
//                                                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
//                                                                         Selected
//                                                                     </span>
//                                                                 ) : (
//                                                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                                                         Available
//                                                                     </span>
//                                                                 )}
//                                                             </td>
//                                                         </tr>
//                                                     );
//                                                 })}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-8 border rounded-lg">
//                                     <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                                     <p className="text-gray-500">
//                                         {searchQuery ? "No seats found matching your search" : "No seats available at this time"}
//                                     </p>
//                                     {searchQuery && (
//                                         <Button
//                                             onClick={() => setSearchQuery("")}
//                                             variant="outline"
//                                             size="sm"
//                                             className="mt-3"
//                                         >
//                                             Clear Search
//                                         </Button>
//                                     )}
//                                 </div>
//                             )}
//                         </>
//                     )}

//                     {/* Actions */}
//                     <div className="flex justify-end gap-3 pt-2 border-t">
//                         <Button onClick={onClose} variant="outline">
//                             Cancel
//                         </Button>
//                         <Button
//                             onClick={submitSeat}
//                             disabled={!selectedSeat || loading || hasSeat}
//                             className="min-w-32"
//                         >
//                             Confirm Allocation
//                         </Button>
//                     </div>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }


import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, Users, Search } from "lucide-react";
import useGetSeatList from "./useGetSeatList";
import { updateStudentSeat } from "@/services/StudentServices/studentService";

export default function SeatAllocation({ open, onClose, student, onVerified }) {
    const { data: seats, loading, error, refetch } = useGetSeatList();
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const hasFingerprint = !!student?.capture;
    const hasSeat = student?.iecsm_seat_num != null;
    const isDisabled = student?.is_disabled === "Y";

    const processedSeats = useMemo(() => {
        if (!seats) return [];

        // ✅ Case 1: Student already has a seat assigned
        if (hasSeat) {
            const assignedSeat = seats.find(seat => seat.center_seat_id === student.iecsm_seat_num);
            return assignedSeat ? [assignedSeat] : [];
        }

        // ✅ Case 2: Student does not have a seat yet
        let availableSeats = seats.filter(seat => seat.center_is_available === "Y");

        if (isDisabled) {
            availableSeats = availableSeats.filter(seat => seat.center_floor_number === 1);
        } else {
            const nonFloor1Seats = availableSeats.filter(seat => seat.center_floor_number !== 1);
            if (nonFloor1Seats.length > 0) availableSeats = nonFloor1Seats;
        }

        return availableSeats.sort((a, b) => {
            if (isDisabled) {
                if (a.center_block === "A" && b.center_block !== "A") return -1;
                if (a.center_block !== "A" && b.center_block === "A") return 1;
                if (a.center_block === "A" && b.center_block === "A") {
                    return a.center_room - b.center_room;
                }
            }
            if (a.center_block !== b.center_block) return a.center_block.localeCompare(b.center_block);
            if (a.center_hall !== b.center_hall) return a.center_hall.localeCompare(b.center_hall);
            if (a.center_room !== b.center_room) return a.center_room.localeCompare(b.center_room);
            if (a.center_row !== b.center_row) return a.center_row.localeCompare(b.center_row);
            return a.center_seat_number.localeCompare(b.center_seat_number);
        });
    }, [seats, isDisabled, hasSeat, student?.iecsm_seat_num]);

    const filteredSeats = useMemo(() => {
        if (!searchQuery.trim()) return processedSeats;
        const query = searchQuery.toLowerCase();

        return processedSeats.filter(seat =>
            String(seat.center_block || "").toLowerCase().includes(query) ||
            String(seat.center_hall || "").toLowerCase().includes(query) ||
            String(seat.center_room || "").toLowerCase().includes(query) ||
            String(seat.center_row || "").toLowerCase().includes(query) ||
            String(seat.center_seat_number || "").toLowerCase().includes(query) ||
            String(seat.center_seat_remark || "").toLowerCase().includes(query) ||
            String(seat.center_seat_label || "").toLowerCase().includes(query)
        );
    }, [processedSeats, searchQuery]);


    const submitSeat = async () => {
        if (!selectedSeat) return;
        try {
            const payload = { iecsm_seat_num: selectedSeat.center_seat_id };
            const response = await updateStudentSeat(student?.id, payload);
            if (response.data.status) {
                toast.success(response.data.msg || "Seat allocated successfully!");
                onVerified(student, selectedSeat);
                refetch();
                onClose();
            } else {
                toast.error(response.data.msg || "Failed to allocate seat");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to allocate seat");
        }
    };

    if (!student || !hasFingerprint) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-full">
                <div className="max-h-[80vh] overflow-y-auto space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            Seat Allocation
                            {isDisabled && (
                                <span className="flex items-center gap-1 text-sm font-normal text-green-600 bg-blue-50 px-2 py-1 rounded">
                                    <Users className="w-4 h-4" />
                                    Priority Access for PWD Students
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Student Info */}
                    <div className="bg-gray-50 p-3 rounded-lg flex gap-2">
                        <p className="text-sm font-medium text-gray-700">
                            {student.name} ({student.roll_number})
                        </p>
                        <p className={`text-sm font-medium ${student.is_disabled === "Y" ? "text-green-500" : "text-red-500"} `}>
                            PWD Status: {student.is_disabled === "Y" ? "Yes" : "No"}
                        </p>
                    </div>


                    {/* ✅ Already Allocated */}
                    {hasSeat ? (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-green-800 text-sm font-medium">
                            Seat already allocated: <span className="font-semibold">{student.center_seat_label}</span>
                        </div>
                    ) : (
                        <>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by block, hall, room, row, seat number, or remarks..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Table */}

                            {/* Table */}
                            {!loading && !error && (
                                <>
                                    {filteredSeats.length > 0 ? (
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="max-h-96 overflow-y-auto overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead className="bg-gray-50 sticky top-0">
                                                        <tr className="border-b">
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Block
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Floor
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Hall
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Room
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Row
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Seat
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Remarks
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Seat Lable
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {filteredSeats.map((seat) => {
                                                            const isSelected = selectedSeat?.center_seat_id === seat.center_seat_id;
                                                            const isPriority = isDisabled && seat.center_block === "A";

                                                            return (
                                                                <tr
                                                                    key={seat.center_seat_id}
                                                                    onClick={() => setSelectedSeat(seat)}
                                                                    className={`
                                cursor-pointer transition-colors
                                ${isSelected
                                                                            ? "bg-blue-100 hover:bg-blue-100"
                                                                            : isPriority
                                                                                ? "bg-green-50 hover:bg-green-100"
                                                                                : "hover:bg-gray-50"
                                                                        }
                              `}
                                                                >
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`font-semibold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                                                                {seat.center_block}
                                                                            </span>
                                                                            {isPriority && (
                                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                                                    Priority
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                                                        {seat.center_floor_number}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
                                                                        {seat.center_hall}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                                                        {seat.center_room}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
                                                                        {seat.center_row}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                                                        {seat.center_seat_number}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-800" : "text-gray-600"}`}>
                                                                        {seat.center_seat_remark || "-"}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm ${isSelected ? "text-blue-800" : "text-gray-600"}`}>
                                                                        {seat.center_seat_label || "-"}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {isSelected ? (
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                                                                Selected
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                                Available
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border rounded-lg">
                                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">
                                                {searchQuery ? "No seats found matching your search" : "No seats available at this time"}
                                            </p>
                                            {searchQuery && (
                                                <Button
                                                    onClick={() => setSearchQuery("")}
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3"
                                                >
                                                    Clear Search
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2 border-t">
                                <Button onClick={onClose} variant="outline">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitSeat}
                                    disabled={!selectedSeat || loading || hasSeat}
                                    className="min-w-32"
                                >
                                    Confirm Allocation
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
