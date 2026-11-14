
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";

// export default function ZipFileUpload({
//     selectedFile,
//     onFileSelect,
//     error,
//     showCard = false,
// }) {
//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             onFileSelect(file);
//             toast.info(`Selected file: ${file.name}`);
//         }
//     };

//     const content = (
//         <div className="space-y-2">
//             <Input
//                 type="file"
//                 accept=".zip" // ✅ Only allow .zip files
//                 onChange={handleFileChange}
//             />
//             {selectedFile && (
//                 <p className="text-sm text-muted-foreground">
//                     Selected: <strong>{selectedFile.name}</strong>
//                 </p>
//             )}
//             {error && <p className="text-sm text-red-500">{error}</p>}
//         </div>
//     );

//     return showCard ? (
//         <Card className="max-w-md mx-auto mt-5 shadow-md">
//             <CardHeader>
//                 <CardTitle className="text-xl">Upload ZIP File (optional)</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">{content}</CardContent>
//         </Card>
//     ) : (
//         content
//     );
// }

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ZipFileUpload({
    selectedFile,
    onFileSelect,
    error,
    showCard = false,
}) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // ✅ Validate file type
            const allowedTypes = ["application/zip", "application/x-zip-compressed"];
            const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

            if (!allowedTypes.includes(file.type) && fileExtension !== ".zip") {
                toast.error("Invalid file type! Only ZIP files are allowed.");
                e.target.value = ""; // Clear the input
                return;
            }

            onFileSelect(file);
            toast.info(`Selected file: ${file.name}`);
        }
    };

    const content = (
        <div className="space-y-2">
            <Input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
            />
            {selectedFile && (
                <p className="text-sm text-muted-foreground">
                    Selected: <strong>{selectedFile.name}</strong>
                </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );

    return showCard ? (
        <Card className="max-w-md mx-auto mt-5 shadow-md">
            <CardHeader>
                <CardTitle className="text-xl">Upload ZIP File (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">{content}</CardContent>
        </Card>
    ) : (
        content
    );
}