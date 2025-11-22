// lib/toast.ts
"use client"

import { toast } from "sonner"

/**
 * 成功提示 (绿色)
 * @param message 提示内容
 */
export const successToast = (message: string) => {
  toast.success(message, {
    style: {
      background: "#f0fdf4",
      color: "#166534", 
      border: "1px solid #bbf7d0"
    }
  })
}

/**
 * 错误提示 (红色)
 * @param message 提示内容
 */
export const errorToast = (message: string) => {
  toast.error(message, {
    style: {
      background: "#fef2f2", 
      color: "#991b1b", 
      border: "1px solid #fecaca" 
    }
  })
}
