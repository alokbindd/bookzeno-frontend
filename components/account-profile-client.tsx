"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/api"

type ProfileState = UserProfile & {
  address_line_1?: string
  address_line_2?: string
  username?: string
  email?: string
}

export function AccountProfileClient() {
  const [profile, setProfile] = useState<ProfileState | null>(null)
  const [originalProfile, setOriginalProfile] = useState<ProfileState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await getUserProfile()
      if (!data) {
        setProfile(null)
        setOriginalProfile(null)
        return
      }

      const dashboard: any = (data as any).dashboard || {}

      const normalized: ProfileState = {
        ...(data as any),
        first_name: dashboard.first_name ?? (data as any).first_name,
        last_name: dashboard.last_name ?? (data as any).last_name,
        username: dashboard.username,
        email: dashboard.email,
        address_line_1:
          (data as any).address_line_1 ??
          (data as any).address_line1 ??
          "",
        address_line_2:
          (data as any).address_line_2 ??
          (data as any).address_line2 ??
          "",
        profile_picture:
          (data as any).profile_picture ?? dashboard.profile_picture,
      }

      setProfile(normalized)
      setOriginalProfile(normalized)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[account] Failed to load profile", error)
      }
      setErrorMessage("Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (field: keyof ProfileState, value: string) => {
    setProfile((prev) => ({ ...(prev || {}), [field]: value }))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicturePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
      setProfilePictureFile(file)
    }
    e.target.value = ""
  }

  useEffect(() => {
    return () => {
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview)
      }
    }
  }, [profilePicturePreview])

  const validate = () => {
    const nextErrors: { phone_number?: string; pincode?: string } = {}
    const phone = profile?.phone_number ?? ""
    const pincode = profile?.pincode ?? ""

    if (phone && !/^\d+$/.test(phone)) {
      nextErrors.phone_number = "Phone number must be numeric"
    }
    if (pincode && !/^\d+$/.test(pincode)) {
      nextErrors.pincode = "Pincode must be numeric"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !originalProfile) return
    setSuccessMessage(null)
    setErrorMessage(null)
    setErrors({})

    if (!validate()) {
      return
    }

    const fields: (keyof ProfileState)[] = [
      "phone_number",
      "address_line_1",
      "address_line_2",
      "city",
      "state",
      "pincode",
      "country",
    ]

    const formData = new FormData()
    let hasChanges = false

    fields.forEach((field) => {
      const current = (profile as any)[field] ?? ""
      const original = (originalProfile as any)[field] ?? ""
      if (current !== original) {
        formData.append(field, String(current))
        hasChanges = true
      }
    })

    if (profilePictureFile) {
      formData.append("profile_picture", profilePictureFile)
      hasChanges = true
    }

    if (!hasChanges) {
      setSuccessMessage("No changes to save")
      return
    }

    setSaving(true)
    try {
      const res = await updateUserProfile(formData)
      const ok = (res as any)?.success !== false
      if (!ok) {
        throw new Error((res as any)?.message || "Failed to update profile")
      }
      toast.success("Profile updated successfully")
      setProfilePictureFile(null)
      setProfilePicturePreview(null)
      await loadProfile()
    } catch (error: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[account] Failed to update profile", error)
      }
      const errData = error?.data ?? {}
      const apiErrors = (typeof errData.errors === "object" ? errData.errors : null) ?? errData
      const fieldErrors: Record<string, string> = {}
      if (apiErrors && typeof apiErrors === "object") {
        for (const [key, val] of Object.entries(apiErrors)) {
          if (Array.isArray(val) && val[0]) {
            fieldErrors[key] = String(val[0])
          } else if (typeof val === "string") {
            fieldErrors[key] = val
          }
        }
      }
      setErrors(fieldErrors)
      setErrorMessage(
        Object.keys(fieldErrors).length > 0
          ? "Please fix the errors below."
          : "Failed to update profile. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load profile.
      </p>
    )
  }

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Account"

  const avatarSrc =
    profilePicturePreview ||
    profile.profile_picture ||
    profile.dashboard?.profile_picture ||
    undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfilePictureChange}
      />
      <div>
        <h1 className="mb-4 text-xl font-semibold text-foreground">
          Profile
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-16 w-16 overflow-hidden rounded-full bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {avatarSrc ? (
                avatarSrc.startsWith("blob:") ? (
                  <img
                    src={avatarSrc}
                    alt="Profile picture preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={avatarSrc}
                    alt="Profile picture"
                    fill
                    className="object-cover"
                  />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                  {fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Pencil className="h-5 w-5 text-white" />
              </div>
            </button>
            <div>
              <p className="text-base font-semibold text-foreground">
                {fullName}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.email || profile.dashboard?.email || "—"}
              </p>
            </div>
          </div>

          <div />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Username</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
            value={profile.username || ""}
            disabled
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
            value={profile.email || profile.dashboard?.email || ""}
            disabled
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Phone Number
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={profile.phone_number ?? ""}
            onChange={(e) => handleChange("phone_number", e.target.value)}
          />
          {errors.phone_number && (
            <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Pincode</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={profile.pincode ?? ""}
            onChange={(e) => handleChange("pincode", e.target.value)}
          />
          {errors.pincode && (
            <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">City</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={profile.city ?? ""}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">State</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={profile.state ?? ""}
            onChange={(e) => handleChange("state", e.target.value)}
          />
          {errors.state && (
            <p className="mt-1 text-xs text-red-500">{errors.state}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">
            Address Line 1
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={profile.address_line_1 ?? profile.address_line1 ?? ""}
            onChange={(e) =>
              handleChange("address_line_1", e.target.value)
            }
          />
          {errors.address_line_1 && (
            <p className="mt-1 text-xs text-red-500">{errors.address_line_1}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">
            Address Line 2
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={profile.address_line_2 ?? profile.address_line2 ?? ""}
            onChange={(e) =>
              handleChange("address_line_2", e.target.value)
            }
          />
          {errors.address_line_2 && (
            <p className="mt-1 text-xs text-red-500">{errors.address_line_2}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Country</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={profile.country ?? ""}
            onChange={(e) => handleChange("country", e.target.value)}
          />
          {errors.country && (
            <p className="mt-1 text-xs text-red-500">{errors.country}</p>
          )}
        </div>
      </div>

      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  )
}

