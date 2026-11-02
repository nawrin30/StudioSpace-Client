"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Studio } from "@/types";

export default function EditStudioPage() {
  const params = useParams<{ id: string }>();
  const studioId = params.id;
  const router = useRouter();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get<Studio>(`/studios/${studioId}`)
      .then((response) => setStudio(response.data))
      .catch((error: unknown) => toast.error(getErrorMessage(error, "Studio not found.")))
      .finally(() => setLoading(false));
  }, [studioId]);

  async function uploadImage(file?: File) {
    if (!file) return;
    const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!key) { toast.error("Add NEXT_PUBLIC_IMGBB_API_KEY to client/.env.local first."); return; }
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { toast.error("Choose an image file up to 5 MB."); return; }
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

  function updateField(field: keyof Studio, value: string | number) {
    setStudio((current) => current ? { ...current, [field]: value } : current);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studio) return;

    try {
      await api.patch(`/studios/${studioId}`, {
        title: studio.title,
        category: studio.category,
        hourlyRate: Number(studio.hourlyRate),
        securityDeposit: Number(studio.securityDeposit),
        maxCapacity: Number(studio.maxCapacity),
        location: studio.location,
        imageUrl: studio.imageUrl,
        amenities: studio.amenities,
        overview: studio.overview,
      });
      toast.success("Studio updated successfully.");
      router.push("/my-listings");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not update this studio."));
    }
  }

  if (loading) return <main className="page shell"><div className="empty">Loading listing…</div></main>;
  if (!studio) return <main className="page shell"><div className="empty">This studio could not be found.</div></main>;

  return (
    <main className="page shell">
      <div className="form-card">
        <h1 className="page-title">Update studio.</h1>
        <form onSubmit={handleSubmit}>
          <label className="field">Studio title<input required value={studio.title} onChange={(event) => updateField("title", event.target.value)} /></label>
          <label className="field">Category<input required value={studio.category} onChange={(event) => updateField("category", event.target.value)} /></label>
          <label className="field">Hourly rate<input type="number" min="0" required value={studio.hourlyRate} onChange={(event) => updateField("hourlyRate", Number(event.target.value))} /></label>
          <label className="field">Security deposit<input type="number" min="0" value={studio.securityDeposit} onChange={(event) => updateField("securityDeposit", Number(event.target.value))} /></label>
          <label className="field">Maximum capacity<input type="number" min="1" required value={studio.maxCapacity} onChange={(event) => updateField("maxCapacity", Number(event.target.value))} /></label>
          <label className="field">Location<input required value={studio.location} onChange={(event) => updateField("location", event.target.value)} /></label>
          <label className="field">Upload studio image<input type="file" accept="image/*" onChange={(event) => void uploadImage(event.target.files?.[0])} /><small className="muted">ImgBB upload, maximum 5 MB.</small><input type="url" required value={studio.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} />{uploading && <span>Uploading…</span>}</label>
          <label className="field">Amenities (comma separated)<input value={studio.amenities.join(", ")} onChange={(event) => setStudio((current) => current ? { ...current, amenities: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } : current)} /></label>
          <label className="field">Overview<textarea required value={studio.overview} onChange={(event) => updateField("overview", event.target.value)} /></label>
          <p className="muted">Host: {studio.ownerName} · {studio.ownerEmail}</p>
          <button className="btn btn-dark">Save changes</button>
        </form>
      </div>
    </main>
  );
}
