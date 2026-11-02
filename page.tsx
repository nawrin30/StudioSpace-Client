"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Booking } from "@/types";
type HostBooking = Booking & { userName: string; userEmail: string; studio: NonNullable<Booking["studio"]> };
export default function HostBookingsPage() {
  const [items, setItems] = useState<HostBooking[]>([]); const [loading, setLoading] = useState(true); const [busyId, setBusyId] = useState("");
  const load = useCallback(async () => { try { const r = await api.get<HostBooking[]>("/bookings/host"); setItems(r.data); } catch (e) { toast.error(getErrorMessage(e, "Could not load booking requests. Sign in as a host.")); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function update(id: string, status: "Confirmed" | "Cancelled" | "Completed") { setBusyId(id); try { await api.patch(`/bookings/${id}/status`, { status }); toast.success(`Booking ${status.toLowerCase()}.`); await load(); } catch (e) { toast.error(getErrorMessage(e, "Could not update booking.")); } finally { setBusyId(""); } }
  return <main className="page shell"><span className="eyebrow">Host workspace</span><h1 className="page-title">Booking requests.</h1><p className="muted">Review and manage reservations for your studio listings.</p>
    {loading ? <div className="skeleton skeleton-line"/> : items.length ? <div className="table-wrap"><table>
      <thead><tr><th>Studio</th><th>Creator</th><th>Date & time</th>
      <th>Total</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{items.map((b) => <tr key={b._id}><td>{b.studio?.title}</td>
      <td>{b.userName}<br/><small>{b.userEmail}</small></td><td>{b.date}<br/>{b.startTime}–{b.endTime}</td>
      <td>${b.totalPrice.toFixed(2)}</td><td>
        <span className="badge-status">{b.status}</span></td>
        <td>{b.status === "Pending" && <><button disabled={busyId === b._id} onClick={() => void update(b._id, "Confirmed")}>Confirm</button>{" "}<button disabled={busyId === b._id} onClick={() => void update(b._id, "Cancelled")}>Decline</button></>}{b.status === "Confirmed" && <button disabled={busyId === b._id} onClick={() => void update(b._id, "Completed")}>Mark completed</button>}</td>
        </tr>)}</tbody></table>
        </div> : <div className="empty"><h3>No booking requests yet.</h3>
        <p className="muted">New reservations for your spaces will appear here.</p></div>}
  </main>;
}
