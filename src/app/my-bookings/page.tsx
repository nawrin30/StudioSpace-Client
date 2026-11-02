"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Booking } from "@/types";
import jsPDF from "jspdf";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      const response = await api.get<Booking[]>("/bookings/mine");
      setBookings(response.data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not load your bookings."));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  function downloadInvoice(booking: Booking) {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text("StudioSpace — Booking Receipt", 18, 22);
    doc.setFontSize(11);
    doc.text(`Booking ID: ${booking._id}`, 18, 42);
    doc.text(`Studio: ${booking.studio?.title || "Studio"}`, 18, 52);
    doc.text(`Location: ${booking.studio?.location || "—"}`, 18, 62);
    doc.text(`Date: ${booking.date}`, 18, 72);
    doc.text(`Time: ${booking.startTime} - ${booking.endTime}`, 18, 82);
    doc.text(`Status: ${booking.status}`, 18, 92);
    doc.text(`Total: $${Number(booking.totalPrice).toFixed(2)}`, 18, 102);
    doc.text("This receipt reflects the booking status at the time of download.", 18, 120);
    doc.save(`StudioSpace-booking-${booking._id}.pdf`);
  }

  async function cancelBooking(bookingId: string) {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled.");
      await loadBookings();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not cancel this booking."));
    }
  }

  return (
    <main className="page shell">
      <span className="eyebrow">Your production calendar</span>
      <h1 className="page-title">My bookings.</h1>

      {loading ? (
        <div className="empty">Loading your bookings…</div>
      ) : bookings.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Studio</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.studio?.title || "Studio"}</td>
                  <td>{booking.date}</td>
                  <td>{booking.startTime}–{booking.endTime}</td>
                  <td><span className="badge-status">{booking.status}</span></td>
                  <td>
                    {booking.status === "Confirmed" && <button type="button" onClick={() => downloadInvoice(booking)}>Download PDF</button>}{" "}
                    {booking.status === "Pending" && (
                      <button type="button" onClick={() => void cancelBooking(booking._id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <h3>Your next creative session starts here.</h3>
          <p className="muted">You haven't requested a studio booking yet.</p>
          <Link href="/studios" className="btn btn-dark">Explore studios</Link>
        </div>
      )}
    </main>
  );
}
