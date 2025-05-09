import AdminUsers from "@/components/admin-users"

export const metadata = {
  title: "Manage Users - SUHBA Countdown",
  description: "Manage users for the SUHBA countdown calendar",
}

export default function UsersPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Manage Users</h1>
      <AdminUsers />
    </div>
  )
}
