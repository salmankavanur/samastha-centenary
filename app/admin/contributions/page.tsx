import AdminContributions from "@/components/admin-contributions"

export const metadata = {
  title: "Manage Contributions - SUHBA Countdown",
  description: "Manage user contributions for the SUHBA countdown calendar",
}

export default function ContributionsPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Manage Contributions</h1>
      <AdminContributions />
    </div>
  )
}
