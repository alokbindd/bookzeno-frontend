import type { Metadata } from "next"
import { AccountProfileClient } from "@/components/account-profile-client"

export const metadata: Metadata = {
  title: "Account Profile - Bookzeno",
}

export default function AccountProfilePage() {
  return (
    <div>
      <AccountProfileClient />
    </div>
  )
}

