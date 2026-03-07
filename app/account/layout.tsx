import type { ReactNode } from "react"
import { AccountLayoutClient } from "@/components/account-layout-client"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>
}

