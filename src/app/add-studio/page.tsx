"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { StudioFormValues } from "@/types";

const initialForm: StudioFormValues = {
  title: "",
  category: "Photo Studio",
  hourlyRate: "",
  securityDeposit: "0",
  maxCapacity: "1",
  location: "",
  imageUrl: "",
  amenities: "",
  overview: "",
};

const categories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
  "Other",
];

export default function AddStudioPage() {
  const [form, setForm] = useState<StudioFormValues>(initialForm);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file?: File) {
    if (!file) return;
    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!key) { toast.error("Add NEXT_PUBLIC_IMGBB_API_KEY to client/.env.local first."); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be 5 MB or smaller."); return; }
    setUploading(true);
    try {
      const body = new FormData(); body.append("image", file);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Image upload failed.");
      updateField("imageUrl", result.data.display_url); toast.success("Image uploaded successfully.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Image upload failed."); }
    finally { setUploading(false); }
  }

  function updateField(field: keyof StudioFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    const payload = {
      ...form,
      hourlyRate: Number(form.hourlyRate),
      securityDeposit: Number(form.securityDeposit),
      maxCapacity: Number(form.maxCapacity),
      amenities: form.amenities
        .split(",")
        .map((amenity) => amenity.trim())
        .filter(Boolean),
    };

    try {
      await api.post("/studios", payload);
      toast.success("Your studio is now listed.");
      router.push("/my-listings");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Please log in before listing a studio."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page shell">
      <div className="form-card">
        <span className="eyebrow">Give your space a spotlight</span>
        <h1 className="page-title">List a studio.</h1>
        <p className="muted">Share the details creators need to book with confidence.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              Studio title
              <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
            </label>
            <label className="field">
              Category
              <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="field">
              Hourly rate ($)
              <input type="number" min="1" required value={form.hourlyRate} onChange={(event) => updateField("hourlyRate", event.target.value)} />
            </label>
            <label className="field">
              Security deposit ($)
              <input type="number" min="0" value={form.securityDeposit} onChange={(event) => updateField("securityDeposit", event.target.value)} />
            </label>
            <label className="field">
              Maximum capacity
              <input type="number" min="1" required value={form.maxCapacity} onChange={(event) => updateField("maxCapacity", event.target.value)} />
            </label>
            <label className="field">
              Location / address
              <input required value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </label>
            <label className="field full">Studio image
              <input type="file" accept="image/*" onChange={(event) => void uploadImage(event.target.files?.[0])} />
              <small className="muted">Upload an image to ImgBB (maximum 5 MB), or paste a direct image URL below.</small>
              <input type="url" required value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} placeholder="https://…" />
              {uploading && <span className="muted">Uploading image…</span>}
              {form.imageUrl && <img className="upload-preview" src={form.imageUrl} alt="Studio preview" />}
            </label>
            <label className="field full">
              Amenities (separate with commas)
              <input value={form.amenities} onChange={(event) => updateField("amenities", event.target.value)} placeholder="Lighting, Wi-Fi, Backdrop" />
            </label>
            <label className="field full">
              Detailed overview
              <textarea required value={form.overview} onChange={(event) => updateField("overview", event.target.value)} placeholder="Describe the space, equipment and ideal use cases." />
            </label>
          </div>

          <button className="btn btn-dark" disabled={busy || uploading}>
            {busy ? "Publishing…" : "Publish studio ↗"}
          </button>
        </form>
      </div>
    </main>
  );
}
