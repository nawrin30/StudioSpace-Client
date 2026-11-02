"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { api } from "@/lib/api";
import type { Studio } from "@/types";

const categories = [
  { icon: "📸", title: "Photo Studios", description: "Bright, beautiful sets", value: "Photo Studio" },
  { icon: "🎬", title: "Film Stages", description: "Room for big stories", value: "Film Stage" },
  { icon: "🎙️", title: "Podcast Rooms", description: "Sound made simple", value: "Podcast Lounge" },
  { icon: "🎹", title: "Music Suites", description: "Find your frequency", value: "Music Suite" },
  { icon: "🎨", title: "Art Workshops", description: "Make a little mess", value: "Workshop" },
];

const slides = [
  {
    title: "Make room for your next idea.",
    description: "Discover inspiring studios, book the right setup, and get straight to making something remarkable.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Find the space behind the story.",
    description: "From podcast lounges to production stages, find a place that fits your creative brief.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Your space can inspire someone.",
    description: "Share your studio with creators and turn available hours into new opportunities.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=85",
  },
];

export default function HomePage() {
  const [featuredStudios, setFeaturedStudios] = useState<Studio[]>([]);

  useEffect(() => {
    api.get<Studio[]>("/studios/featured")
      .then((response) => {
        setFeaturedStudios(response.data);
      })
      .catch(() => setFeaturedStudios([]));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="shell">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.title}>
                <div className="hero-grid">
                  <div>
                    <span className="eyebrow">A creative space for every vision</span>
                    <h1>{slide.title.split(" ").slice(0, -2).join(" ")}<br /><em>{slide.title.split(" ").slice(-2).join(" ")}</em></h1>
                    <p>{slide.description}</p>
                    <div className="hero-actions">
                      <Link href="/studios" className="btn btn-lime">Explore studios ↗</Link>
                      <Link href="/add-studio" className="btn btn-outline" style={{ color: "white", borderColor: "#637166" }}>Host your space</Link>
                    </div>
                    <p className="muted" style={{ fontSize: 12, marginTop: 30 }}>✳ Spaces with character. Bookings without the back-and-forth.</p>
                  </div>
                  <div className="hero-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.image} alt="Creative studio interior" />
                    <div className="hero-tag">✦ Your space to create, all in one place</div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="section shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">Handpicked spaces</span>
            <h2>Spaces worth creating in.</h2>
            <p className="muted">A few good places to get your ideas moving.</p>
          </div>
          <Link href="/studios" className="btn btn-outline">View all studios ↗</Link>
        </div>

        {featuredStudios.length > 0 ? (
          <div className="studio-grid">
            {featuredStudios.map((studio) => (
              <article className="studio-card" key={studio._id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={studio.imageUrl || "/studio-placeholder.svg"}
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
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>New creative spaces are on the way.</h3>
            <p className="muted">Be the first to share a studio with the community.</p>
            <Link href="/add-studio" className="btn btn-dark">Host your space</Link>
          </div>
        )}
      </section>

      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">Find your kind of space</span>
              <h2>What are you making?</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link href={`/studios?category=${encodeURIComponent(category.value)}`} className="category" key={category.value}>
                <span className="emoji">{category.icon}</span>
                <b>{category.title}</b>
                <small>{category.description}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell" id="how">
        <span className="eyebrow">No complicated production</span>
        <h2>From idea to action in four steps.</h2>
        <p className="muted">Everything you need to get from “what if” to “that's a wrap”.</p>
        <div className="steps" style={{ marginTop: 35 }}>
          {[
            ["01", "Discover spaces", "Explore unique spaces that fit your creative brief."],
            ["02", "Select your hours", "Choose the date and time that works for you."],
            ["03", "Book your space", "Send a booking request and coordinate with your host."],
            ["04", "Create & produce", "Show up, make something brilliant, repeat."],
          ].map(([number, title, description]) => (
            <div className="step" key={number}>
              <strong>{number}</strong>
              <h3>{title}</h3>
              <p className="muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="guarantee">
          <div>
            <span className="eyebrow">Good people. Great spaces.</span>
            <h2>More creating. Less worrying.</h2>
            <p>We make it easier to find a space you can trust, so you can focus on the work that matters.</p>
            <Link href="/studios" className="btn btn-dark">Find your studio ↗</Link>
          </div>
          <div className="guarantee-list">
            {[
              ["✦", "Verified profiles", "Know who you're booking with."],
              ["⌂", "Space details upfront", "Clear amenities, rates and capacity."],
              ["♡", "Creator-first support", "A human-friendly experience when plans change."],
              ["✓", "Safer bookings", "Booking records and transparent status updates."],
            ].map(([icon, title, description]) => (
              <div key={title}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <b>{title}</b>
                <small className="muted">{description}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
