"use client";
import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useState } from "react";

export function UploadImage({ onImageAdded, image }: {
    onImageAdded: (image: string) => void;
    image?: string;
}) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress

    async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]; // Get the selected file
        if (!file) return; // Check if a file is selected

        setUploading(true); // Set uploading state to true

        try {
            // Get the presigned URL from the backend
            const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
                headers: {
                    "Authorization": localStorage.getItem("token"),
                },
            });

            const presignedUrl = response.data.preSignedUrl;

            // Upload the file directly to S3 using the presigned URL
            await axios.put(presignedUrl, file, {
                headers: {
                    "Content-Type": file.type,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted); // Update upload progress
                    console.log(`Upload Progress: ${percentCompleted}%`);
                },
            });

            // Construct the uploaded image URL
            const uploadedImageUrl = `${CLOUDFRONT_URL}/labelsync/${file.name}`;
            onImageAdded(uploadedImageUrl); // Callback with the uploaded image URL

        } catch (e) {
            console.error("Error uploading image:", e); // Log any error
        }

        setUploading(false); // Set uploading state to false
    }

    // If an image URL is provided, render the image
    if (image) {
        return <img className={"p-2 w-96 rounded"} src={image} alt="Uploaded" />;
    }

    return (
        <div>
            <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
                <div className="h-full flex justify-center flex-col relative w-full">
                    <div className="h-full flex justify-center w-full pt-16 text-4xl">
                        {uploading ? (
                            <div className="text-sm">Uploading... {uploadProgress}%</div>
                        ) : (
                            <>
                                +
                                <input
                                    className="w-full h-full bg-red-400 w-40 h-40"
                                    type="file"
                                    style={{
                                        position: "absolute",
                                        opacity: 0,
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                    onChange={onFileSelect}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
