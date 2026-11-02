"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Studio } from "@/types";
export default function WishlistPage() {
  const [items, setItems] = useState<Studio[]>([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const r = await api.get<Studio[]>("/wishlist"); setItems(r.data); } catch (e) { toast.error(getErrorMessage(e, "Sign in to view your saved studios.")); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function remove(id: string) { try { await api.delete(`/wishlist/${id}`); toast.success("Removed from wishlist."); await load(); } catch (e) { toast.error(getErrorMessage(e, "Could not remove this studio.")); } }
  return <main className="page shell"><span className="eyebrow">Your shortlist</span><h1 className="page-title">Saved studios.</h1>{loading ? <div className="skeleton skeleton-line"/> : items.length ? <div className="studio-grid">{items.map((studio) => <article className="studio-card" key={studio._id}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={studio.imageUrl} alt={studio.title}/><div className="card-body"><span className="pill">{studio.category}</span><h3>{studio.title}</h3><p className="muted">{studio.location}</p><div className="card-bottom"><b>${studio.hourlyRate}/hr</b><Link className="btn btn-dark small" href={`/studios/${studio._id}`}>View details</Link><button onClick={() => void remove(studio._id)} aria-label={`Remove ${studio.title}`}>♥</button></div></div></article>)}</div> : <div className="empty"><h3>Your wishlist is empty.</h3><p className="muted">Save studios you like and compare them later.</p><Link className="btn btn-dark" href="/studios">Explore studios</Link></div>}</main>;
}
