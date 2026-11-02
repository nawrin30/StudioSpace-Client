"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Studio } from "@/types";

export default function StudioDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [saved, setSaved] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([api.get<Studio>(`/studios/${id}`), api.get<Studio[]>("/wishlist").catch(() => ({ data: [] as Studio[] }))])
      .then(([studioResponse, wishlistResponse]) => {
        if (!active) return;
        setStudio(studioResponse.data);
        setSaved(wishlistResponse.data.some((item) => item._id === id));
      })
      .catch((error: unknown) => toast.error(getErrorMessage(error, "Studio not found.")))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function toggleWishlist() {
    try {
      if (saved) await api.delete(`/wishlist/${id}`);
      else await api.post(`/wishlist/${id}`);
      setSaved(!saved);
      toast.success(saved ? "Removed from saved studios." : "Studio saved to your wishlist.");
    } catch (error) { toast.error(getErrorMessage(error, "Please log in to save studios.")); }
  }

  async function requestBooking() {
    if (!date || endTime <= startTime) { toast.error("Choose a valid date and time range."); return; }
    setBooking(true);
    try {
      await api.post("/bookings", { studioId: id, date, startTime, endTime });
      toast.success("Booking request sent. The host will review it.");
    } catch (error) { toast.error(getErrorMessage(error, "Could not send booking request.")); }
    finally { setBooking(false); }
  }

  if (loading) return <main className="page shell"><div className="skeleton skeleton-hero"/><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line short"/></main>;
  if (!studio) return <main className="page shell"><div className="empty"><h2>Studio not found</h2><p className="muted">This listing may have been removed.</p><a className="btn btn-dark" href="/studios">Back to studios</a></div></main>;

  const images = [studio.imageUrl];
  const duration = Math.max(0, (Number(endTime.slice(0, 2)) * 60 + Number(endTime.slice(3)) - Number(startTime.slice(0, 2)) * 60 - Number(startTime.slice(3))) / 60);
  return <main className="page shell">
    <div className="detail-grid">
      <section>
        <div className="gallery-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[galleryIndex] || "/studio-placeholder.svg"}
            alt={`${studio.title} gallery ${galleryIndex + 1}`}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/studio-placeholder.svg";
            }}
          />
          <button className="gallery-next" onClick={() => setGalleryIndex((galleryIndex + 1) % images.length)} aria-label="Next gallery image">›</button>
        </div>
        <div className="detail-title-row"><span className="pill">{studio.category}</span><button className="btn btn-outline" onClick={() => void toggleWishlist()}>{saved ? "♥ Saved" : "♡ Save studio"}</button></div>
        <h1 className="page-title">{studio.title}</h1>
        <p className="muted">⌖ {studio.location}　·　★ {studio.rating || "New"}</p>
        <p className="detail-overview">{studio.overview}</p>
        <h3>Studio specifications</h3>
        <div className="spec-grid"><div><b>Capacity</b><span>Up to {studio.maxCapacity} people</span></div><div><b>Hourly rate</b><span>${studio.hourlyRate} / hour</span></div><div><b>Security deposit</b><span>${studio.securityDeposit || 0}</span></div><div><b>Host</b><span>{studio.ownerName}</span></div></div>
        <h3>What’s included</h3><div className="amenity-list">{studio.amenities.map((amenity) => <span className="pill" key={amenity}>✓ {amenity}</span>)}</div>
        <h3>Hosted by {studio.ownerName}</h3><p className="muted">{studio.ownerEmail}</p>
        <div className="empty review-note"><h3>Creator reviews</h3><p className="muted">Reviews will appear here after completed bookings.</p></div>
      </section>
      <aside className="specs booking-panel"><span className="price">${studio.hourlyRate}<small> / hour</small></span><p className="muted">A booking request is confirmed by the host.</p><hr/><h3>Request this workspace</h3>
        <label className="field">Date<input type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={(e) => setDate(e.target.value)}/></label>
        <label className="field">Start time<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}/></label>
        <label className="field">End time<input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}/></label>
        <div className="booking-total"><span>Estimated total ({duration.toFixed(1)} hrs)</span><b>${(duration * studio.hourlyRate).toFixed(2)}</b></div>
        <button disabled={!date || booking || duration <= 0} onClick={() => void requestBooking()} className="btn btn-dark" style={{width:"100%"}}>{booking ? "Sending request…" : "Book workspace now ↗"}</button>
      </aside>
    </div>
  </main>;
}
