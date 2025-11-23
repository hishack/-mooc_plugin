import { useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { errorToast, successToast } from "~components/alter"

export const useMessaging = () => {
  const [loading, setLoading] = useState(false)

  const sendToContentScript = async <T = any>(
    messageName: string,
    payload?: any,
    options?: {
      onSuccess?: (response: T) => void;
      onError?: (error: any) => void;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    setLoading(true)
    try {
      const response = await sendToBackground({
        name: messageName,
        body: payload
      })

      if (response?.success) {
        options?.onSuccess?.(response)
        if (options?.successMessage) {
          successToast(options.successMessage)
        }
        return response
      } else {
        throw new Error(response?.message || "请求失败")
      }
    } catch (error) {
      options?.onError?.(error)
      if (options?.errorMessage) {
        errorToast(options.errorMessage)
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { sendToContentScript, loading }
}