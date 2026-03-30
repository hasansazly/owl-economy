"use client";

import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { getStudentProfile } from "@/lib/app-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const categoryOptions = [
  "Resell",
  "Books",
  "Services",
  "Events",
  "Lost & Found",
  "Fundraise",
  "Rooms",
  "Creative",
] as const;

type FormErrors = Partial<Record<"photos" | "title" | "category" | "description" | "location" | "price" | "general", string>>;
type LocalPhoto = {
  file: File;
  previewUrl: string;
};

function mapCategory(category: string) {
  if (category === "Books") return "Books";
  if (category === "Events") return "Event";
  if (category === "Lost & Found") return "Lost & Found";
  if (category === "Fundraise") return "Fundraise";
  if (category === "Rooms") return "Room";
  if (category === "Creative") return "Campus Creative";
  return category;
}

async function compressImageFile(file: File) {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image processing is not available.");
  }

  const maxSize = 800;
  const scale = Math.min(maxSize / imageBitmap.width, maxSize / imageBitmap.height, 1);
  canvas.width = Math.round(imageBitmap.width * scale);
  canvas.height = Math.round(imageBitmap.height * scale);
  context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  console.log(`[create-listing] original image size: ${file.size} bytes`);

  let blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", 0.8);
  });

  if (!blob) {
    throw new Error("Could not compress image.");
  }

  if (blob.size > 300 * 1024) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.6);
    });

    if (!blob) {
      throw new Error("Could not compress image.");
    }
  }

  console.log(`[create-listing] compressed image size: ${blob.size} bytes`);
  imageBitmap.close();

  return blob;
}

export default function CreateListingPage() {
  const profile = getStudentProfile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const titleCount = title.length;
  const descriptionCount = description.length;

  const firstFourPhotos = photos.slice(0, 4);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (firstFourPhotos.length === 0) nextErrors.photos = "Add at least one photo.";
    if (!title.trim()) nextErrors.title = "Add a title.";
    if (!category.trim()) nextErrors.category = "Choose a category.";
    if (!description.trim()) nextErrors.description = "Add a short description.";
    if (!location.trim()) nextErrors.location = "Add a location.";
    if (price && Number.isNaN(Number(price))) nextErrors.price = "Enter a valid price.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenPicker = () => {
    fileInputRef.current?.click();
  };

  const handleSelectPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []).slice(0, 4 - photos.length);
    if (incoming.length === 0) return;

    setPhotos((current) => [
      ...current,
      ...incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setErrors((current) => ({ ...current, photos: "", general: "" }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrors({ general: "Supabase is not configured." });
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error("You must be logged in to post");
      }

      const listingId = crypto.randomUUID();

      await supabase.storage.createBucket("listings", {
        public: true,
      });

      const uploadedUrls: string[] = [];
      for (const [index, photo] of firstFourPhotos.entries()) {
        const compressed = await compressImageFile(photo.file);
        const storagePath = `listings/${user.id}_${Date.now()}_${index}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("listings")
          .upload(storagePath, compressed, {
            upsert: true,
            contentType: "image/jpeg",
          });

        if (uploadError) {
          throw uploadError;
        }

        const uploadedPath = uploadData?.path || storagePath;
        const { data: publicUrlData } = supabase.storage.from("listings").getPublicUrl(uploadedPath);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } = await supabase.from("listings").insert({
        id: listingId,
        user_id: user.id,
        title: title.trim(),
        price: price.trim() ? Number(price) : 0,
        category: mapCategory(category),
        description: description.trim(),
        location: location.trim(),
        images: uploadedUrls,
        status: "active",
        poster_name: profile.name.trim() || "Temple Student",
        major: profile.major.trim() || null,
        class_year: profile.classYear.trim() || null,
        contact_email: profile.email.trim() || user.email || null,
        email: profile.email.trim() || user.email || null,
      } as never);

      if (insertError) {
        throw insertError;
      }

      window.location.href = "/";
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Could not post listing.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const helperText = useMemo(() => {
    return "Listings on Temple campus move fast";
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0916] px-5 pb-[calc(env(safe-area-inset-bottom)+32px)] pt-[calc(env(safe-area-inset-top)+8px)] text-[#F0EEFF]">
      <div className="mx-auto w-full max-w-[100vw]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[20px] text-[rgba(240,238,255,0.5)]"
            aria-label="Back to feed"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <section className="mt-4 space-y-5 pb-[320px]">
          <div className="space-y-3">
            <p className="text-[12px] text-[rgba(240,238,255,0.45)]">Photos</p>
            <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={handleOpenPicker}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[12px] border border-dashed border-[rgba(107,92,231,0.4)] text-[#9B8FFF]"
              >
                <Plus className="h-6 w-6" />
              </button>

              {firstFourPhotos.map((photo, index) => (
                <div key={photo.previewUrl} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px] border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.previewUrl} alt={`Selected listing ${index + 1}`} className="h-20 w-20 object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(10,9,22,0.82)] text-white"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleSelectPhotos}
            />
            {errors.photos ? <p className="text-[12px] text-[#F5A623]">{errors.photos}</p> : null}
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Title</label>
              <div className="rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value.slice(0, 80));
                    setErrors((current) => ({ ...current, title: "" }));
                  }}
                  placeholder="What are you selling?"
                  className="border-0 bg-transparent px-0"
                />
                <p className="mt-2 text-right text-[12px] text-[rgba(240,238,255,0.45)]">{titleCount}/80</p>
              </div>
              {errors.title ? <p className="mt-2 text-[12px] text-[#F5A623]">{errors.title}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Price</label>
              <div className="flex h-12 items-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4">
                <span className="mr-2 text-[15px] text-[rgba(240,238,255,0.45)]">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => {
                    setPrice(event.target.value.replace(/[^\d.]/g, ""));
                    setErrors((current) => ({ ...current, price: "" }));
                  }}
                  placeholder="0.00"
                  className="h-full border-0 bg-transparent px-0"
                />
              </div>
              {errors.price ? <p className="mt-2 text-[12px] text-[#F5A623]">{errors.price}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Category</label>
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categoryOptions.map((option) => {
                  const active = category === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setCategory(option);
                        setErrors((current) => ({ ...current, category: "" }));
                      }}
                      className={`shrink-0 rounded-[20px] border px-4 py-2 text-[13px] ${
                        active
                          ? "border-[#6B5CE7] bg-[rgba(107,92,231,0.2)] text-[#9B8FFF]"
                          : "border-white/10 bg-[rgba(255,255,255,0.04)] text-[rgba(240,238,255,0.45)]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {errors.category ? <p className="mt-2 text-[12px] text-[#F5A623]">{errors.category}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Description</label>
              <div className="rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3">
                <textarea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value.slice(0, 500));
                    setErrors((current) => ({ ...current, description: "" }));
                  }}
                  placeholder="Describe your item, condition, pickup location..."
                  className="min-h-[100px] border-0 bg-transparent px-0"
                />
                <p className="mt-2 text-right text-[12px] text-[rgba(240,238,255,0.45)]">{descriptionCount}/500</p>
              </div>
              {errors.description ? <p className="mt-2 text-[12px] text-[#F5A623]">{errors.description}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Location</label>
              <input
                type="text"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setErrors((current) => ({ ...current, location: "" }));
                }}
                placeholder="e.g. Morgan Hall, Johnson Hall, Off-campus"
                className="px-4"
              />
              {errors.location ? <p className="mt-2 text-[12px] text-[#F5A623]">{errors.location}</p> : null}
            </div>
          </div>

          {errors.general ? <p className="text-[12px] text-[#F5A623]">{errors.general}</p> : null}

          <div className="pt-2">
            <p className="mb-3 text-center text-[12px] text-[rgba(240,238,255,0.45)]">{helperText}</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex h-[52px] w-full items-center justify-center rounded-[20px] bg-[#6B5CE7] px-4 text-[16px] font-medium text-white disabled:opacity-45"
            >
              {submitting ? "Posting..." : "Post listing"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
