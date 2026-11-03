export function getStudioImage(category: string, imageUrl?: string) {
  const images: Record<string, string> = {
    "Photo Studio": "/photoshop.png",
    "Film Stage": "/flimstage.png",
    "Podcast Lounge": "/podcast.png",
    "Music Suite": "/music.png",
    "Workshop": "/workshop.png",
  };

  return images[category] || imageUrl || "/studio-placeholder.svg";
}