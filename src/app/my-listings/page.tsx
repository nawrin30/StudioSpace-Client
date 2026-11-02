"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Studio } from "@/types";

export default function MyListingsPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudios = useCallback(async () => {
    try {
      const response = await api.get<Studio[]>("/studios/mine");
      setStudios(response.data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not load your listings."));
      setStudios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudios();
  }, [loadStudios]);

  async function deleteStudio() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/studios/${deleteTarget._id}`);
      toast.success("Studio listing deleted.");
      setDeleteTarget(null);
      await loadStudios();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not delete this listing."));
    } finally { setDeleting(false); }
  }

  return (
    <main className="page shell">
      <span className="eyebrow">Your spaces</span>
      <h1 className="page-title">My studio listings.</h1>
      <div className="section-head">
        <p className="muted">Manage the creative spaces you share.</p>
        <Link className="btn btn-dark" href="/add-studio">+ Add studio</Link>
      </div>

      {loading ? (
        <div className="empty">Loading your studio listings…</div>
      ) : studios.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Studio</th>
                <th>Category</th>
                <th>Rate / hr</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studios.map((studio) => (
                <tr key={studio._id}>
                  <td>{studio.title}</td>
                  <td>{studio.category}</td>
                  <td>${studio.hourlyRate}</td>
                  <td>
                    <Link href={`/studios/edit/${studio._id}`}>Edit</Link>
                    <button type="button" onClick={() => setDeleteTarget(studio)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <h3>No listings yet.</h3>
          <p className="muted">Your studio could be someone's next favourite workspace.</p>
          <Link href="/add-studio" className="btn btn-dark">List your space</Link>
        </div>
      )}
      {deleteTarget && <div className="modal-backdrop" role="presentation" onClick={() => !deleting && setDeleteTarget(null)}>
        <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={(event) => event.stopPropagation()}>
          <span className="modal-icon">!</span><h2 id="delete-title">Delete this studio?</h2>
          <p className="muted">“{deleteTarget.title}” will be permanently removed. This action cannot be undone.</p>
          <div className="modal-actions"><button className="btn btn-outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>Keep listing</button><button className="btn btn-danger" disabled={deleting} onClick={() => void deleteStudio()}>{deleting ? "Deleting…" : "Yes, delete"}</button></div>
        </section>
      </div>}
    </main>
  );
}
