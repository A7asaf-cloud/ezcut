import Image from "next/image";

export default function PhotoGallery({
  photos,
}: {
  photos: { date: string; url: string }[];
}) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Your physique photos will show up here as you log days.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {photos.map((photo) => (
        <div key={photo.date} className="space-y-1">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-neutral-800">
            <Image
              src={photo.url}
              alt={`Physique photo from ${photo.date}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <p className="text-center text-xs text-neutral-500">{photo.date}</p>
        </div>
      ))}
    </div>
  );
}
