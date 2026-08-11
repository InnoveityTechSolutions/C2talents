"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Building2, 
  GraduationCap, 
  Users, 
  Image as ImageIcon, 
  Tag, 
  Copy, 
  Unlink, 
  RotateCcw,
  History,
  HardDrive
} from "lucide-react";

export default function AdminHealthCheckPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore Modal State
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/health-check");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load health check data");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleRestore = async () => {
    if (!selectedBackup) return;
    if (confirmInput !== "RESTORE DATA") {
      alert('Please type "RESTORE DATA" exactly to confirm restoration.');
      return;
    }

    setRestoring(true);
    setRestoreMessage(null);
    try {
      const res = await fetch("/api/admin/restore-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedBackup,
          confirmation: confirmInput,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Restoration failed");
      
      setRestoreMessage(`✅ ${json.message}`);
      setSelectedBackup(null);
      setConfirmInput("");
      fetchHealthData();
    } catch (err: any) {
      alert(`Restoration error: ${err.message}`);
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 bg-stone-800/80 backdrop-blur px-6 py-4 rounded-xl border border-stone-700 shadow-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
          <span className="font-medium text-stone-200">Running Real-Time Database Health Checks...</span>
        </div>
      </div>
    );
  }

  const { health, backups, auditLogs } = data || {};

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl">
              <Database className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-stone-100 via-stone-200 to-teal-400 bg-clip-text text-transparent">
                Database Architecture & Health Monitor
              </h1>
              <p className="text-stone-400 text-sm mt-0.5">
                Production-Safe Verification Engine & Disaster Recovery Control
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHealthData}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2.5 rounded-xl border border-stone-700 transition font-medium text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-teal-400" />
            Run Diagnostics
          </button>
          
          <div className={`px-4 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
            health?.systemStatus === 'HEALTHY' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {health?.systemStatus === 'HEALTHY' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SYSTEM SECURE
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                WARNING DETECTED
              </>
            )}
          </div>
        </div>
      </div>

      {restoreMessage && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-between">
          <span>{restoreMessage}</span>
          <button onClick={() => setRestoreMessage(null)} className="text-xs text-stone-400 hover:text-stone-200">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
          Error: {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard title="Total Colleges" value={health?.totalColleges} icon={Building2} color="teal" />
          <MetricCard title="Total Courses" value={health?.totalCourses} icon={GraduationCap} color="indigo" />
          <MetricCard title="Total Users" value={health?.totalUsers} icon={Users} color="emerald" />
          <MetricCard title="Missing Images" value={health?.missingImages} icon={ImageIcon} color="amber" isAlert={health?.missingImages > 0} />
          <MetricCard title="Missing Categories" value={health?.missingCategories} icon={Tag} color="rose" isAlert={health?.missingCategories > 0} />
          <MetricCard title="Missing Ownership" value={health?.missingOwnership} icon={ShieldCheck} color="purple" isAlert={health?.missingOwnership > 0} />
          <MetricCard title="Duplicate Colleges" value={health?.duplicateColleges} icon={Copy} color="orange" isAlert={health?.duplicateColleges > 0} />
          <MetricCard title="Broken Relations" value={health?.brokenCourseRelations} icon={Unlink} color="red" isAlert={health?.brokenCourseRelations > 0} />
          <MetricCard title="Broken Images" value={health?.brokenImages} icon={ImageIcon} color="yellow" isAlert={health?.brokenImages > 0} />
          <MetricCard title="Soft Deleted" value={health?.softDeletedColleges} icon={RotateCcw} color="stone" />
        </div>

        {/* Disaster Recovery & Automated Backups */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-semibold text-stone-100">Automated SQL Backups & Recovery System</h2>
            </div>
            <span className="text-xs text-stone-400 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
              {backups?.length || 0} Snapshots Available
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Snapshot File</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {backups && backups.length > 0 ? (
                  backups.map((b: any) => (
                    <tr key={b.filename} className="hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-teal-300">{b.filename}</td>
                      <td className="py-3.5 px-4 text-stone-400">{(b.sizeBytes / 1024 / 1024).toFixed(2)} MB</td>
                      <td className="py-3.5 px-4 text-stone-400">{new Date(b.createdAt).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedBackup(b.filename)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg transition text-xs font-medium"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-500">
                      No backups found. Run a backup via CLI or API.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Trail */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-stone-100">Database Audit Log Trail</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Time</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4 rounded-r-lg">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3 px-4 text-xs text-stone-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                          log.action === 'SOFT_DELETE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          log.action === 'RESTORE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-teal-500/10 text-teal-400 border-teal-500/30'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-300 font-medium">{log.entity}</td>
                      <td className="py-3 px-4 text-stone-400">{log.actorEmail || 'System'}</td>
                      <td className="py-3 px-4 text-stone-300 text-xs truncate max-w-xs">{log.details || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      No audit events logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {selectedBackup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-500/40 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Confirm Database Restoration</h3>
            </div>
            
            <p className="text-stone-300 text-sm">
              You are about to restore the database from snapshot:
              <br />
              <code className="bg-stone-950 text-teal-300 px-2 py-1 rounded text-xs mt-1 inline-block font-mono">
                {selectedBackup}
              </code>
            </p>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <p className="font-semibold text-stone-200">Safety System Note:</p>
              <p>• An automatic pre-restore safety snapshot will be created before restoring.</p>
              <p>• This action will replace current tables with the selected backup state.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-stone-400 font-medium">
                Type <strong className="text-rose-400 font-mono">RESTORE DATA</strong> to authorize:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="RESTORE DATA"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setSelectedBackup(null); setConfirmInput(""); }}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={restoring || confirmInput !== "RESTORE DATA"}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-sm transition flex items-center gap-2"
              >
                {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Authorize Restoration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, isAlert }: any) {
  const colors: Record<string, string> = {
    teal: "text-teal-400 border-teal-500/20 bg-teal-500/5",
    indigo: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    orange: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    red: "text-red-400 border-red-500/20 bg-red-500/5",
    yellow: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
    stone: "text-stone-400 border-stone-700 bg-stone-900/40",
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color] || colors.stone} shadow-lg transition hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-stone-400">{title}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-stone-100">{value ?? 0}</span>
        {isAlert && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
            ATTN
          </span>
        )}
      </div>
    </div>
  );
}
