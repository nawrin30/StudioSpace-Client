"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import type { Studio } from "@/types";
import { getStudioImage } from "@/lib/studio-images";

const categories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const selectedCategory = new URLSearchParams(window.location.search).get("category");
    setCategory(selectedCategory || "");
  }, []);

  useEffect(() => {
    let active = true;

    api.get<Studio[]>("/studios")
      .then((response) => {
        if (active) setStudios(response.data);
      })
      .catch(() => {
        if (active) setStudios([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function deleteStudio() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/studios/${deleteTarget._id}`);
      setStudios((current) => current.filter((studio) => studio._id !== deleteTarget._id));
      toast.success("Studio listing deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete this studio. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const filteredStudios = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return studios.filter((studio) => {
      const matchesCategory = !category ||
        studio.category.toLowerCase().includes(category.toLowerCase());
      const searchableText = `${studio.title} ${studio.location} ${studio.category}`.toLowerCase();
      return matchesCategory && searchableText.includes(normalizedQuery);
    });
  }, [studios, query, category]);

  return (
    <main className="page shell">
      <span className="eyebrow">The space is yours</span>
      <h1 className="page-title">Explore studios.</h1>
      <p className="muted">Find the right room, setup and energy for your next project.</p>

      <div className="searchbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by studio, city or category…"
          aria-label="Search studios"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="empty">Finding creative spaces…</div>
      ) : filteredStudios.length > 0 ? (
        <div className="studio-grid">
          {filteredStudios.map((studio) => (
            <article className="studio-card" key={studio._id}>
              {}
              <img
                src={getStudioImage(studio.category, studio.imageUrl)}
                alt={studio.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/studio-placeholder.svg";
                }}
              />
              <div className="card-body">
                <div className="card-meta">
                  <span className="pill">{studio.category}</span>
                  <span>★ {studio.rating || "New"}</span>
                </div>
                <h3>{studio.title}</h3>
                <span className="muted">⌖ {studio.location}</span>
                <div className="card-bottom">
                  <span className="price">${studio.hourlyRate}<small> / hr</small></span>
                  <Link className="btn btn-dark small" href={`/studios/${studio._id}`}>View details ↗</Link>
                </div>
                {user?.email?.toLowerCase() === studio.ownerEmail?.toLowerCase() && (
                  <div className="studio-owner-actions">
                    <Link className="btn btn-outline small" href={`/studios/edit/${studio._id}`}>✎ Edit</Link>
                    <button className="btn btn-danger small" type="button" onClick={() => setDeleteTarget(studio)}>♲ Delete</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>No studios found just yet.</h3>
          <p className="muted">Try another search, or be the first to list a creative space.</p>
          <Link href="/add-studio" className="btn btn-dark">List a studio</Link>
        </div>
      )}
      {deleteTarget && (
        <div className="modal-backdrop" role="presentation" onClick={() => !deleting && setDeleteTarget(null)}>
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="modal-icon">!</span>
            <h2 id="explore-delete-title">Delete this studio?</h2>
            <p className="muted">“{deleteTarget.title}” will be permanently removed. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" disabled={deleting} onClick={() => setDeleteTarget(null)}>Keep listing</button>
              <button className="btn btn-danger" type="button" disabled={deleting} onClick={() => void deleteStudio()}>{deleting ? "Deleting…" : "Yes, delete"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
