"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, ImageIcon, Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { uploadImage } from "@/app/actions/upload"
import { toast } from "sonner"
import Image from "next/image"

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ imageUrl: string; analysis: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)

    try {
      const resp = await uploadImage(formData)
      if (resp.success) {
        setResult({
          imageUrl: resp.imageUrl,
          analysis: resp.analysis,
        })
        toast.success("Analysis complete!")
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative group cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/20 group-hover:border-white/40 transition-colors rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 bg-white/5">
                  <div className="p-4 rounded-full bg-white/10 text-white/60 group-hover:scale-110 group-hover:text-white transition-all duration-300">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-white/80">Drop your image here</p>
                    <p className="text-sm text-white/40 mt-1">PNG, JPG or WEBP (max. 10MB)</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/20 shadow-inner">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  {!isUploading && !result && (
                    <button
                      onClick={reset}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {!result && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 rounded-xl transition-all shadow-xl group"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        Start Analysis
                        <Sparkles className="ml-2 h-5 w-5 group-hover:scale-125 transition-transform" />
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl border-l-4 border-l-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center space-y-1 gap-2 text-white/50 text-sm uppercase tracking-wider font-bold">
                  <Sparkles size={16} />
                  <span>AI Insight</span>
                </div>
                <p className="text-xl leading-relaxed text-white/90 font-light italic">
                  "{result.analysis}"
                </p>
                <div className="pt-4">
                  <Button variant="ghost" onClick={reset} className="text-white/40 hover:text-white hover:bg-white/10">
                    Process another image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
