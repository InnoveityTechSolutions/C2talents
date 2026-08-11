"use client";

import { useEffect, useState } from "react";
import { Users, Plus, ShieldCheck, Mail, Lock, UserPlus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { PopupModal } from "@/components/ui/PopupModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ADMIN");
  const [saving, setSaving] = useState(false);

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, message: "" });

  function showPopup(message: string, type: "success" | "error" | "info" | "warning" = "success", title?: string) {
    setPopup({ isOpen: true, message, type, title });
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return showPopup("Email & password required", "warning", "Validation Error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name }),
      });
      const data = await res.json();
      if (data.user) {
        showPopup(`User ${data.user.email} created as ${data.user.role}!`, "success", "Account Created");
        setEmail("");
        setPassword("");
        setName("");
        fetchUsers();
      } else {
        showPopup(data.error || "User creation failed", "error", "Creation Failed");
      }
    } catch (err: any) {
      showPopup("Error creating user: " + err.message, "error", "User Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1f0c3d] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#3b2075]" /> User & Role Management (RBAC)
          </h1>
          <p className="text-xs text-stone-500 font-medium">Manage CMS access roles: Super Admin, Admin, Editor, College Manager</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition-all shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3b2075]" : ""}`} />
        </button>
      </div>

      <form onSubmit={handleCreateUser} className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#1f0c3d] flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#3b2075]" /> Add New Staff / User
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-stone-900"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@c2talents.com"
              required
              className="w-full bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-stone-900"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-stone-50 px-3 py-2 pr-10 rounded-xl border border-stone-200 text-stone-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-purple-700" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Assign Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-stone-900 font-bold"
            >
              <option value="SUPER_ADMIN">SUPER ADMIN (Full Access)</option>
              <option value="ADMIN">ADMIN (Standard)</option>
              <option value="EDITOR">EDITOR (Content Only)</option>
              <option value="COLLEGE_MANAGER">COLLEGE MANAGER</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#3b2075] hover:bg-[#4c1d95] text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            {saving ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-5">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-purple-50/50">
                <td className="py-3.5 px-5 font-bold text-stone-900">
                  <p>{u.name || "User"}</p>
                  <p className="text-[10px] text-stone-400 font-medium">{u.email}</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    u.role === "SUPER_ADMIN"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-purple-100 text-purple-900"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-stone-500 font-medium">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PopupModal
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
}
