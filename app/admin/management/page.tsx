import { ManagementPageClient } from "@/features/admin/components/management/management-page-client";
import type { AdminCategory, AdminPoll } from "@/features/admin/types";
import { createClient } from "@/utils/supabase/server";

export default async function AdminManagementPage() {
  const supabase = await createClient();
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, created_at")
    .order("name", { ascending: true });

  const { data: polls, error: pollsError } = await supabase
    .from("polls")
    .select(
      `
        id,
        title,
        description,
        status,
        is_featured,
        is_pinned,
        sort_order,
        image_url,
        expires_at,
        closed_at,
        view_count,
        created_at,
        updated_at,
        created_by,
        category:categories (
          id,
          name,
          slug
        ),
        options:poll_options (
          id,
          label,
          description,
          sort_order,
          vote_count,
          created_at
        )
      `,
    );

  const normalizedPolls = ((polls as AdminPoll[] | null) ?? [])
    .map((poll) => ({
      ...poll,
      category: Array.isArray(poll.category) ? poll.category[0] ?? null : poll.category,
      options: [...poll.options].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      ),
    }))
    .sort((a, b) => {
      const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const snapshotKey = JSON.stringify({
    categories: ((categories as AdminCategory[] | null) ?? []).map((category) => [
      category.id,
      category.slug,
    ]),
    polls: normalizedPolls.map((poll) => [
      poll.id,
      poll.updated_at,
      poll.sort_order,
      poll.category?.id ?? null,
      poll.options.length,
    ]),
  });

  return (
    <ManagementPageClient
      key={snapshotKey}
      initialCategories={(categories as AdminCategory[] | null) ?? []}
      initialPolls={normalizedPolls}
      categoriesError={categoriesError?.message ?? null}
      pollsError={pollsError?.message ?? null}
    />
  );
}
