"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File
  if (!file) {
    throw new Error("No file provided")
  }

  // 1. Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
  })

  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) {
    return {
      success: true,
      imageUrl: blob.url,
      analysis: "Modal API URL not configured. Image uploaded successfully to " + blob.url,
    }
  }

  // 2. Call Modal API
  try {
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
      throw new Error(`Modal API error: ${errorText}`)
    }

    const data = await response.json()
    
    revalidatePath("/")
    return {
      success: true,
      imageUrl: blob.url,
      analysis: data.answer,
    }
  } catch (error: any) {
    console.error("Error calling Modal:", error)
    return {
      success: true,
      imageUrl: blob.url,
      analysis: "Error analyzing image: " + error.message,
    }
  }
}
