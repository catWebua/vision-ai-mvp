"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export const maxDuration = 60; // Increase timeout to 60 seconds

export async function uploadImage(formData: FormData) {
  try {
    const startTime = Date.now();
    console.log("Starting upload process...");
    
    const file = formData.get("image") as File
    if (!file) {
      return { success: false, imageUrl: "", analysis: "No file provided" }
    }

    // 1. Upload to Vercel Blob with explicit token
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return { 
        success: false, 
        imageUrl: "", 
        analysis: "Error: BLOB_READ_WRITE_TOKEN is missing on the server." 
      }
    }

    console.log("Uploading to Vercel Blob...");
    const blob = await put(file.name, file, {
      access: "public",
      token: token,
      addRandomSuffix: true,
    })
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Blob uploaded in ${uploadTime}s:`, blob.url);

    const modalUrl = process.env.MODAL_API_URL
    if (!modalUrl) {
      return {
        success: true,
        imageUrl: blob.url,
        analysis: "Modal API URL not configured. Image uploaded to " + blob.url,
      }
    }

    // 2. Call Modal API
    console.log("Calling Modal API at:", modalUrl);
    const response = await fetch(modalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: blob.url,
        prompt: "Describe this image in detail.",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: true,
        imageUrl: blob.url,
        analysis: `AI is offline or busy. Image saved at: ${blob.url}. Error: ${errorText}`,
      }
    }

    const data = await response.json()
    
    revalidatePath("/")
    return {
      success: true,
      imageUrl: blob.url,
      analysis: data.answer,
    }
  } catch (error: any) {
    console.error("Global upload error:", error)
    return {
      success: false,
      imageUrl: "",
      analysis: "Critical error: " + (error.message || "Unknown error"),
    }
  }
}
