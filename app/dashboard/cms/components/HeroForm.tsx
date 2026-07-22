"use client";

import { useActionState } from "react";
import { saveHeroBanner } from "../actions";
import { HeroBanner } from "../types";

interface Props {
  hero: HeroBanner | null;
}

export default function HeroForm({ hero }: Props) {
  const [state, formAction, isPending] = useActionState(saveHeroBanner, {
    success: false,
    message: "",
  });

  return (
    <form action={formAction} className="space-y-6 rounded-xl bg-white border p-6">

      <input
        type="hidden"
        name="id"
        defaultValue={hero?.id}
      />

      <div>
        <label className="block mb-2 font-semibold">
          Hero Title
        </label>

        <input
          name="title"
          defaultValue={hero?.title}
          className="w-full rounded-lg border p-3"
          placeholder="Build Your Dream Home"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Subtitle
        </label>

        <textarea
          name="subtitle"
          defaultValue={hero?.subtitle}
          rows={4}
          className="w-full rounded-lg border p-3"
          placeholder="Subtitle"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">

        <div>
          <label className="block mb-2 font-semibold">
            Button Text
          </label>

          <input
            name="button_text"
            defaultValue={hero?.button_text}
            className="w-full rounded-lg border p-3"
            placeholder="Get Quote"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Button Link
          </label>

          <input
            name="button_link"
            defaultValue={hero?.button_link}
            className="w-full rounded-lg border p-3"
            placeholder="/quote"
          />
        </div>

      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Hero Image URL
        </label>

        <input
          name="image_url"
          defaultValue={hero?.image_url}
          className="w-full rounded-lg border p-3"
          placeholder="https://..."
        />
      </div>

      {hero?.image_url && (
        <img
          src={hero.image_url}
          alt="Hero"
          className="mt-4 h-56 w-full rounded-lg object-cover border"
        />
      )}

      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
      >
        Save Hero Section
      </button>

    </form>
  );
}