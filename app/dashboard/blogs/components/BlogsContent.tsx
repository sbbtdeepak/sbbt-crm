"use client";

import { useState } from "react";
import { Blog } from "../types";
import BlogsTable from "./BlogsTable";
import AddBlogModal from "./AddBlogModal";

interface Props {
  blogs: Blog[];
  error?: string;
}

export default function BlogsContent({
  blogs,
  error,
}: Props) {

  const [open, setOpen] = useState(false);

  return (
    <>

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Blogs
          </h1>

          <p className="mt-1 text-gray-500">
            Manage blog articles.
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
        >
          + Add Blog
        </button>

      </div>

      {error ? (

        <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-600">
          {error}
        </div>

      ) : (

        <BlogsTable blogs={blogs} />

      )}

      <AddBlogModal
        open={open}
        onClose={() => setOpen(false)}
      />

    </>
  );
}