import { useState } from "react";
import { Megaphone, Plus, Trash2, Edit2, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminAnnouncements() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState("megaphone");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const utils = trpc.useUtils();
  const { data: announcements, isLoading } = trpc.admin.announcements.list.useQuery();

  const createMutation = trpc.admin.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("Announcement published");
      utils.admin.announcements.list.invalidate();
      setShowCreate(false);
      setTitle(""); setContent(""); setIcon("megaphone");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.announcements.update.useMutation({
    onSuccess: () => {
      toast.success("Announcement updated");
      utils.admin.announcements.list.invalidate();
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted");
      utils.admin.announcements.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) { toast.error("Please fill in all fields"); return; }
    createMutation.mutate({ title: title.trim(), body: content.trim(), icon });
  };

  const startEdit = (ann: { id: number; title: string; body: string }) => {
    setEditingId(ann.id);
    setEditTitle(ann.title);
    setEditBody(ann.body);
  };

  const handleUpdate = () => {
    if (!editingId || !editTitle.trim() || !editBody.trim()) return;
    updateMutation.mutate({ id: editingId, title: editTitle.trim(), body: editBody.trim() });
  };

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <p className="text-sm text-gray-400 mt-1">Manage platform announcements and notifications</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="h-10 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Create Announcement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
                placeholder="Announcement title..." />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Icon</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
                <option value="megaphone">Megaphone</option>
                <option value="alert">Alert</option>
                <option value="info">Info</option>
                <option value="gift">Gift / Promo</option>
                <option value="wrench">Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
              placeholder="Announcement content..." />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCreate} disabled={createMutation.isPending}
              className="h-9 px-4 bg-amber-500 text-black font-medium rounded-lg text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Publish
            </button>
            <button onClick={() => setShowCreate(false)}
              className="h-9 px-4 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Megaphone className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No announcements yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/60">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Icon</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Created</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <tr key={ann.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3">
                      {editingId === ann.id ? (
                        <div className="space-y-2">
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full h-8 px-2 bg-[#080d19] border border-amber-500/50 rounded text-sm text-white focus:outline-none" />
                          <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={2}
                            className="w-full px-2 py-1 bg-[#080d19] border border-amber-500/50 rounded text-xs text-white focus:outline-none resize-none" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-white">{ann.title}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 ml-6 max-w-[400px] truncate">{ann.body}</p>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-gray-400 capitalize">{ann.icon ?? "megaphone"}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{formatDate(ann.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {editingId === ann.id ? (
                          <>
                            <button onClick={handleUpdate} disabled={updateMutation.isPending}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-colors" title="Save">
                              {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-800 text-gray-400 transition-colors" title="Cancel">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(ann)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-800 text-gray-400 hover:text-amber-400 transition-colors" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteMutation.mutate({ id: ann.id })} disabled={deleteMutation.isPending}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
