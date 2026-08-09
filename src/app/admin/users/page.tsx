"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  image: string | null
  createdAt: string
  business: { name: string; plan: string } | null
  staff: { business: { name: string } } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "" })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    })
  }

  const handleSave = async () => {
    if (!editingUser) return

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, ...editForm }),
      })

      if (res.ok) {
        setEditingUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const roleColors: Record<string, string> = {
    CUSTOMER: "bg-blue-500/10 text-blue-400",
    STAFF: "bg-green-500/10 text-green-400",
    BUSINESS_OWNER: "bg-[#E8B547]/10 text-[#E8B547]",
    ADMIN: "bg-red-500/10 text-red-400",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#EFE9DA]">Users</h1>
          <p className="text-[#EFE9DA]/50 mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#263329]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#263329]/50 hover:bg-[#141C18]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#263329] flex items-center justify-center text-sm font-medium text-[#EFE9DA]">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#EFE9DA]">{user.name || "Unnamed"}</div>
                          <div className="text-xs text-[#EFE9DA]/50">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[user.role] || ""}`}>
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">
                      {user.business?.name || user.staff?.business?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/50">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Phone</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="BUSINESS_OWNER">Business Owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="primary" className="flex-1" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
