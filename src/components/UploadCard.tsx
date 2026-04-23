"use client"

import React, { useState, useRef } from "react"
import { Upload, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react"
import { upload } from "@vercel/blob/client"
import { toast } from "sonner"
import { useTranslations, useLocale } from "next-intl"

interface UploadResult {
  success: boolean
  answer?: string
  imageUrl?: string
  error?: string
}

export default function UploadCard() {
  const t = useTranslations('UploadCard');
  const locale = useLocale();
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [result, setResult] = useState<UploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error(t('fileTooLarge'))
        return
      }
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
      setResult(null)
    }
  }

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(blob || file);
          }, "image/jpeg", 0.8);
        };
      };
    });
  };

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setIsAnalyzing(false)
    setResult(null)
    setStatus(t('optimizing'))

    try {
      // 1. Compress image before upload
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
      
      setStatus(t('uploading'))
      // 2. Client-side upload to Vercel Blob
      const blob = await upload(file.name, compressedFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      setIsUploading(false)
      setIsAnalyzing(true)
      setStatus(t('analyzing'))

      // 3. Direct call to Modal API
      const modalApiUrl = process.env.NEXT_PUBLIC_MODAL_API_URL || 'https://catwebua--analyze-v2.modal.run';
      const finalUrl = modalApiUrl.endsWith('/analyze') ? modalApiUrl : `${modalApiUrl}/analyze`;
      
      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_url: blob.url, 
          prompt: t('aiPrompt'),
          language: locale
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      setResult({
        success: true,
        answer: data.answer,
        imageUrl: blob.url
      })
      toast.success(t('analysisComplete'))
    } catch (error: any) {
      console.error("Upload error details:", error)
      let errorMessage = "An unexpected error occurred"
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("Load failed")) {
          errorMessage = t('serverError')
        } else {
          errorMessage = error.message
        }
      }
      
      setResult({
        success: false,
        error: errorMessage
      })
      toast.error(t('analysisFailed'))
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
      setStatus("")
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div 
        className={`relative group bg-white/5 border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          preview ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 hover:border-white/20"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center space-y-4 cursor-pointer py-8"
          >
            <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-white/50" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white/80">{t('dropImage')}</p>
              <p className="text-sm text-white/40 mt-1">{t('fileFormats')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
              {!isUploading && !isAnalyzing && !result && (
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-white/70" />
                </button>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              {status && (
                <p className="text-sm font-medium text-purple-400 animate-pulse text-center">
                  {status}
                </p>
              )}
              
              {!result && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading || isAnalyzing}
                  className="relative px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold text-white shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center space-x-3 overflow-hidden group"
                >
                  {isUploading || isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('thinking')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{t('analyzePhoto')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <Sparkles className="w-12 h-12 text-purple-500" />
            </div>
            
            <div className="flex items-center space-x-2 text-purple-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('aiInsight')}</span>
            </div>

            {result.success ? (
              <p className="text-white/90 text-lg leading-relaxed italic">
                &ldquo;{result.answer}&rdquo;
              </p>
            ) : (
              <div className="flex items-start space-x-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">{t('analysisFailed')}</p>
                  <p className="text-sm opacity-80">{result.error}</p>
                </div>
              </div>
            )}

            <button 
              onClick={reset}
              className="mt-6 text-sm text-white/40 hover:text-white/60 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('processAnother')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
