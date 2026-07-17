"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { feedbackStatuses, type FeedbackStatus } from "@/features/feedback/types";
import type {
  AdminActionState,
  CategoryActionState,
  MockUserSeedState,
  VoteCampaignState,
} from "./types";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: FormDataEntryValue | null) {
  const text = normalizeText(value);
  return text ? text : null;
}

function normalizeBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

function normalizeInteger(value: FormDataEntryValue | null) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeDate(value: FormDataEntryValue | null) {
  const text = normalizeText(value);
  return text ? new Date(text).toISOString() : null;
}

function slugifyCategoryName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const categorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function formatBatchTimestamp(date: Date) {
  return date.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function randomTimestampBetween(startAt: Date, endAt: Date) {
  const startMs = startAt.getTime();
  const endMs = endAt.getTime();

  if (startMs === endMs) {
    return new Date(startMs).toISOString();
  }

  const timestamp = startMs + Math.floor(Math.random() * (endMs - startMs + 1));
  return new Date(timestamp).toISOString();
}

function normalizeDateInput(value: FormDataEntryValue | null) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isFeedbackStatus(value: string): value is FeedbackStatus {
  return feedbackStatuses.includes(value as FeedbackStatus);
}

function parseSerializedOptions(input: string) {
  try {
    const parsed = JSON.parse(input) as Array<{
      id?: string;
      label?: string;
      description?: string;
      sort_order?: number;
      vote_count?: number;
    }>;

    return parsed.map((option, index) => ({
      id:
        typeof option.id === "string" && !option.id.startsWith("new-")
          ? option.id
          : undefined,
      label: typeof option.label === "string" ? option.label.trim() : "",
      description:
        typeof option.description === "string" ? option.description.trim() : "",
      sort_order:
        typeof option.sort_order === "number" ? option.sort_order : index,
      vote_count:
        typeof option.vote_count === "number" ? option.vote_count : undefined,
    }));
  } catch {
    return [];
  }
}

type SeedDatasetRow = {
  firstName: string;
  lastName: string;
  country: string;
};

function shuffleDataset<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

async function loadSeedDataset(): Promise<SeedDatasetRow[]> {
  const csvPath = path.join(process.cwd(), "dataset.csv");
  const csv = await readFile(csvPath, "utf8");
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("dataset.csv does not contain any seed rows.");
  }

  const [header, ...rows] = lines;

  if (header !== "first_name,last_name,country") {
    throw new Error(
      "dataset.csv must use the header: first_name,last_name,country",
    );
  }

  const parsedRows = rows
    .map((row) => {
      const [firstName, lastName, country] = row.split(",");

      return {
        firstName: firstName?.trim() ?? "",
        lastName: lastName?.trim() ?? "",
        country: country?.trim() ?? "",
      };
    })
    .filter((row) => row.firstName && row.lastName && row.country);

  if (!parsedRows.length) {
    throw new Error("dataset.csv does not contain valid seed rows.");
  }

  return parsedRows;
}

async function listAllAuthUsers() {
  const adminSupabase = createAdminClient();
  const users: Array<{
    id: string;
    created_at?: string | null;
    user_metadata?: Record<string, unknown> | null;
    app_metadata?: Record<string, unknown> | null;
  }> = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message);
    }

    const chunk = data.users ?? [];
    users.push(...chunk);

    if (chunk.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function recalculateOptionVoteCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pollIds: string[],
) {
  const uniquePollIds = [...new Set(pollIds)].filter(Boolean);

  for (const pollId of uniquePollIds) {
    const { data: pollOptions, error: optionsError } = await supabase
      .from("poll_options")
      .select("id")
      .eq("poll_id", pollId);

    if (optionsError) {
      throw new Error(optionsError.message);
    }

    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("option_id")
      .eq("poll_id", pollId);

    if (votesError) {
      throw new Error(votesError.message);
    }

    const counts = new Map<string, number>();

    for (const vote of votes ?? []) {
      const optionId = vote.option_id as string;
      counts.set(optionId, (counts.get(optionId) ?? 0) + 1);
    }

    for (const option of pollOptions ?? []) {
      const { error: updateError } = await supabase
        .from("poll_options")
        .update({ vote_count: counts.get(option.id) ?? 0 })
        .eq("id", option.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata.role !== "admin") {
    throw new Error("Admin access is required.");
  }

  return { supabase, user };
}

export async function createCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    const { supabase } = await requireAdmin();
    const name = normalizeText(formData.get("name"));
    const customSlug = normalizeText(formData.get("slug"));
    const slug = customSlug || slugifyCategoryName(name);

    if (!name) {
      return { error: "Category name is required." };
    }

    if (!slug) {
      return { error: "Category slug is required." };
    }

    if (!categorySlugPattern.test(slug)) {
      return {
        error: "Use lowercase letters, numbers, and single hyphens only.",
      };
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
      })
      .select("id, name, slug, created_at")
      .single();

    if (error || !category) {
      return { error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/management");
    return { success: "Category created.", category };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create category.",
    };
  }
}

export async function changeUserRole(
  targetUserId: string,
  nextRole: "admin" | "user",
): Promise<AdminActionState> {
  try {
    const { user: actingUser } = await requireAdmin();

    if (!targetUserId) {
      return { error: "Choose a user to update." };
    }

    if (nextRole !== "admin" && nextRole !== "user") {
      return { error: "That role is not allowed." };
    }

    if (actingUser.id === targetUserId && nextRole === "user") {
      return { error: "You cannot remove your own admin access." };
    }

    const adminSupabase = createAdminClient();
    const { data: targetResult, error: targetError } =
      await adminSupabase.auth.admin.getUserById(targetUserId);
    const targetUser = targetResult.user;

    if (targetError || !targetUser) {
      return { error: targetError?.message ?? "User not found." };
    }

    const previousRole = targetUser.app_metadata.role === "admin" ? "admin" : "user";

    if (previousRole === nextRole) {
      return { success: `This user is already ${nextRole === "admin" ? "an admin" : "a normal user"}.` };
    }

    if (previousRole === "admin" && nextRole === "user") {
      const authUsers = await listAllAuthUsers();
      const adminCount = authUsers.filter(
        (authUser) => authUser.app_metadata?.role === "admin",
      ).length;

      if (adminCount <= 1) {
        return { error: "The final administrator cannot be demoted." };
      }
    }

    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      targetUserId,
      {
        app_metadata: {
          ...targetUser.app_metadata,
          role: nextRole,
        },
      },
    );

    if (updateError) {
      return { error: updateError.message };
    }

    const { error: auditError } = await adminSupabase
      .from("admin_role_changes")
      .insert({
        acting_admin_id: actingUser.id,
        new_role: nextRole,
        previous_role: previousRole,
        target_user_email: targetUser.email ?? null,
        target_user_id: targetUserId,
      });

    if (auditError) {
      console.error("[admin-role-change] Audit insert failed:", auditError.message);
    }

    revalidatePath("/admin/users");

    return {
      success:
        nextRole === "admin"
          ? "Admin access granted. The user must refresh their session or sign in again."
          : "Admin access removed. The user must refresh their session or sign in again.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update the user role.",
    };
  }
}

export async function updateFeedback(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase, user } = await requireAdmin();
    const feedbackId = normalizeText(formData.get("feedbackId"));
    const status = normalizeText(formData.get("status"));
    const internalNotes = normalizeNullableText(formData.get("internalNotes"));
    const resolve = formData.get("resolve") === "true";

    if (!feedbackId) {
      return { error: "Feedback id is required." };
    }

    if (!isFeedbackStatus(status)) {
      return { error: "Choose a valid feedback status." };
    }

    const updates: {
      status: FeedbackStatus;
      internal_notes: string | null;
      resolved_at?: string | null;
      resolved_by?: string | null;
    } = {
      status,
      internal_notes: internalNotes,
    };

    if (resolve) {
      updates.status = status === "new" ? "implemented" : status;
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user.id;
    }

    const { error } = await supabase
      .from("feedback")
      .update(updates)
      .eq("id", feedbackId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/feedback");
    return { success: resolve ? "Feedback resolved." : "Feedback updated." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update feedback.",
    };
  }
}

export async function updateCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    const { supabase } = await requireAdmin();
    const categoryId = normalizeText(formData.get("categoryId"));
    const name = normalizeText(formData.get("name"));
    const slug = normalizeText(formData.get("slug"));

    if (!categoryId) {
      return { error: "Category id is required." };
    }

    if (!name) {
      return { error: "Category name is required." };
    }

    if (!slug) {
      return { error: "Category slug is required." };
    }

    if (!categorySlugPattern.test(slug)) {
      return {
        error: "Use lowercase letters, numbers, and single hyphens only.",
      };
    }

    const { data: category, error } = await supabase
      .from("categories")
      .update({
        name,
        slug,
      })
      .eq("id", categoryId)
      .select("id, name, slug, created_at")
      .single();

    if (error || !category) {
      return { error: error?.message ?? "Unable to update category." };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/management");
    return { success: "Category updated.", category };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update category.",
    };
  }
}

export async function deleteCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    const { supabase } = await requireAdmin();
    const categoryId = normalizeText(formData.get("categoryId"));

    if (!categoryId) {
      return { error: "Category id is required." };
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/management");
    return {
      success: "Category deleted.",
      deletedCategoryId: categoryId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to delete category.",
    };
  }
}

export async function createPoll(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase, user } = await requireAdmin();
    const title = normalizeText(formData.get("title"));
    const description = normalizeNullableText(formData.get("description"));
    const categoryId = normalizeText(formData.get("categoryId"));
    const status = normalizeText(formData.get("status")) || "draft";
    const sortOrder = normalizeInteger(formData.get("sortOrder"));
    const imageUrl = normalizeNullableText(formData.get("imageUrl"));
    const expiresAt = normalizeDate(formData.get("expiresAt"));
    const isFeatured = normalizeBoolean(formData.get("isFeatured"));
    const isPinned = normalizeBoolean(formData.get("isPinned"));
    const optionsJson = normalizeText(formData.get("optionsJson"));
    const options = parseSerializedOptions(optionsJson);

    if (!title) {
      return { error: "Poll title is required." };
    }

    if (!categoryId) {
      return { error: "Choose a category for the poll." };
    }

    if (options.length < 2) {
      return { error: "Add at least two options for the poll." };
    }

    const invalidOption = options.find((option) => !option.label);

    if (invalidOption) {
      return { error: "Each option needs a title." };
    }

    const closedAt = status === "closed" ? new Date().toISOString() : null;

    const { data: createdPoll, error: pollError } = await supabase
      .from("polls")
      .insert({
        title,
        description,
        category_id: categoryId,
        status,
        is_featured: isFeatured,
        is_pinned: isPinned,
        sort_order: sortOrder,
        image_url: imageUrl,
        expires_at: expiresAt,
        closed_at: closedAt,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (pollError || !createdPoll) {
      return { error: pollError?.message ?? "Unable to create poll." };
    }

    const { error: optionsError } = await supabase.from("poll_options").insert(
      options.map((option) => ({
        poll_id: createdPoll.id,
        label: option.label,
        description: option.description,
        sort_order: option.sort_order,
      })),
    );

    if (optionsError) {
      return { error: optionsError.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/management");
    return { success: "Poll created." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create poll.",
    };
  }
}

export async function updatePollFlags(formData: FormData) {
  const { supabase } = await requireAdmin();
  const pollId = normalizeText(formData.get("pollId"));

  if (!pollId) {
    throw new Error("Poll id is required.");
  }

  const status = normalizeText(formData.get("status")) || "draft";
  const isFeatured = normalizeBoolean(formData.get("isFeatured"));
  const isPinned = normalizeBoolean(formData.get("isPinned"));
  const sortOrder = normalizeInteger(formData.get("sortOrder"));
  const closedAt = status === "closed" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("polls")
    .update({
      status,
      is_featured: isFeatured,
      is_pinned: isPinned,
      sort_order: sortOrder,
      closed_at: closedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pollId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/management");
}

export async function updatePoll(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin();
    const pollId = normalizeText(formData.get("pollId"));
    const title = normalizeText(formData.get("title"));
    const description = normalizeNullableText(formData.get("description"));
    const categoryId = normalizeText(formData.get("categoryId"));
    const status = normalizeText(formData.get("status")) || "draft";
    const sortOrder = normalizeInteger(formData.get("sortOrder"));
    const imageUrl = normalizeNullableText(formData.get("imageUrl"));
    const expiresAt = normalizeDate(formData.get("expiresAt"));
    const isFeatured = normalizeBoolean(formData.get("isFeatured"));
    const isPinned = normalizeBoolean(formData.get("isPinned"));
    const optionsJson = normalizeText(formData.get("optionsJson"));
    const options = parseSerializedOptions(optionsJson);

    if (!pollId) {
      return { error: "Poll id is required." };
    }

    if (!title) {
      return { error: "Poll title is required." };
    }

    if (!categoryId) {
      return { error: "Category is required." };
    }

    if (options.length < 2) {
      return { error: "Each poll needs at least two options." };
    }

    const invalidOption = options.find((option) => !option.label);

    if (invalidOption) {
      return { error: "Every option needs a title." };
    }

    const closedAt = status === "closed" ? new Date().toISOString() : null;

    const { error: pollError } = await supabase
      .from("polls")
      .update({
        title,
        description,
        category_id: categoryId,
        status,
        is_featured: isFeatured,
        is_pinned: isPinned,
        sort_order: sortOrder,
        image_url: imageUrl,
        expires_at: expiresAt,
        closed_at: closedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pollId);

    if (pollError) {
      return { error: pollError.message };
    }

    const { data: existingOptions, error: optionsFetchError } = await supabase
      .from("poll_options")
      .select("id")
      .eq("poll_id", pollId);

    if (optionsFetchError) {
      return { error: optionsFetchError.message };
    }

    const existingIds = new Set((existingOptions ?? []).map((option) => option.id));
    const submittedIds = new Set(options.map((option) => option.id).filter(Boolean));
    const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id));

    if (idsToDelete.length) {
      const { error: deleteError } = await supabase
        .from("poll_options")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        return { error: deleteError.message };
      }
    }

    for (const [index, option] of options.entries()) {
      const payload = {
        poll_id: pollId,
        label: option.label,
        description: option.description,
        sort_order: index,
      };

      if (option.id) {
        const { error } = await supabase
          .from("poll_options")
          .update(payload)
          .eq("id", option.id);

        if (error) {
          return { error: error.message };
        }
      } else {
        const { error } = await supabase.from("poll_options").insert(payload);

        if (error) {
          return { error: error.message };
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/management");
    return { success: "Poll updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update poll.",
    };
  }
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function reorderPolls(sortedPollIds: string[]) {
  if (!Array.isArray(sortedPollIds) || sortedPollIds.length > 500) {
    throw new Error("Invalid poll list.");
  }

  for (const id of sortedPollIds) {
    if (typeof id !== "string" || !uuidPattern.test(id)) {
      throw new Error("Invalid poll id.");
    }
  }

  const { supabase } = await requireAdmin();

  for (const [index, pollId] of sortedPollIds.entries()) {
    const { error } = await supabase
      .from("polls")
      .update({
        sort_order: index,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pollId);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/management");
}

export async function createMockUsers(
  _previousState: MockUserSeedState,
  formData: FormData,
): Promise<MockUserSeedState> {
  try {
    await requireAdmin();

    const count = normalizeInteger(formData.get("count"));
    const startAt = normalizeDateInput(formData.get("startAt"));
    const endAt = normalizeDateInput(formData.get("endAt"));

    if (!count || count < 1) {
      return { error: "Enter a valid number of users to create." };
    }

    if (count > 1000) {
      return { error: "Create up to 1000 users per batch." };
    }

    if (!startAt || !endAt) {
      return { error: "Choose both a start and end time range." };
    }

    if (startAt > endAt) {
      return { error: "The start date must be before the end date." };
    }

    const adminSupabase = createAdminClient();
    const dataset = shuffleDataset(await loadSeedDataset());
    const batchId = `mock-users-${formatBatchTimestamp(new Date())}`;
    const rangeMs = endAt.getTime() - startAt.getTime();
    const tasks = Array.from({ length: count }, (_, index) => {
      const offset = count === 1 ? 0 : Math.round((rangeMs * index) / (count - 1));
      const mockCreatedAt = new Date(startAt.getTime() + offset).toISOString();
      const email = `${batchId}-${String(index + 1).padStart(4, "0")}@pulsepoll.mock.local`;
      const person = dataset[index % dataset.length];
      const fullName = `${person.firstName} ${person.lastName}`;

      return {
        email,
        mockCreatedAt,
        firstName: person.firstName,
        lastName: person.lastName,
        fullName,
        country: person.country,
      };
    });

    let createdCount = 0;
    let failedCount = 0;
    const chunkSize = 10;

    for (let index = 0; index < tasks.length; index += chunkSize) {
      const chunk = tasks.slice(index, index + chunkSize);
      const results = await Promise.all(
        chunk.map(async (task, taskIndex) => {
          const passwordSeed = String(index + taskIndex + 1).padStart(4, "0");

          const { error } = await adminSupabase.auth.admin.createUser({
            email: task.email,
            password: `MockUser!${passwordSeed}`,
            email_confirm: true,
            user_metadata: {
              first_name: task.firstName,
              last_name: task.lastName,
              full_name: task.fullName,
              country: task.country,
              is_mock: true,
              mock_batch_id: batchId,
              mock_created_at: task.mockCreatedAt,
              seed_source: "admin-seeding-task",
            },
            app_metadata: {
              role: "user",
              is_mock: true,
              mock_batch_id: batchId,
              seed_source: "admin-seeding-task",
            },
          });

          return error;
        }),
      );

      results.forEach((error) => {
        if (error) {
          failedCount += 1;
        } else {
          createdCount += 1;
        }
      });
    }

    if (!createdCount) {
      return {
        error:
          "No mock users were created. Check your service role key or existing seed batch collisions.",
      };
    }

    return {
      success: `Mock user batch created successfully.`,
      batchId,
      createdCount,
      failedCount,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to create mock users.",
    };
  } finally {
    revalidatePath("/admin/seeding-tasks");
  }
}

export async function deleteMockUserBatch(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();

    const batchId = normalizeText(formData.get("batchId"));

    if (!batchId) {
      return { error: "Mock batch id is required." };
    }

    const adminSupabase = createAdminClient();
    const users = await listAllAuthUsers();
    const usersInBatch = users.filter((user) => {
      const metadata = user.user_metadata ?? {};
      return (
        typeof metadata.mock_batch_id === "string" &&
        metadata.mock_batch_id === batchId &&
        metadata.is_mock === true
      );
    });

    if (!usersInBatch.length) {
      return { error: "No mock users were found for that batch." };
    }

    for (const user of usersInBatch) {
      const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

      if (error) {
        return { error: error.message };
      }
    }

    revalidatePath("/admin/seeding-tasks");
    return { success: `Deleted ${usersInBatch.length} users from ${batchId}.` };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to delete mock batch.",
    };
  }
}

export async function createVoteCampaign(
  _previousState: VoteCampaignState,
  formData: FormData,
): Promise<VoteCampaignState> {
  try {
    const { supabase } = await requireAdmin();
    const pollId = normalizeText(formData.get("pollId"));
    const startAt = normalizeDateInput(formData.get("startAt"));
    const endAt = normalizeDateInput(formData.get("endAt"));

    if (!pollId) {
      return { error: "Choose a poll for the vote campaign." };
    }

    if (!startAt || !endAt) {
      return { error: "Choose both a start and end time range." };
    }

    if (startAt > endAt) {
      return { error: "The start date must be before the end date." };
    }

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select(
        `
          id,
          title,
          options:poll_options (
            id,
            label
          )
        `,
      )
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return { error: pollError?.message ?? "Unable to load poll." };
    }

    const optionDefinitions = (poll.options ?? []) as Array<{
      id: string;
      label: string;
    }>;

    if (!optionDefinitions.length) {
      return { error: "That poll does not have any options yet." };
    }

    const countsByOption = optionDefinitions.map((option) => {
      const rawCount = normalizeInteger(formData.get(`option-${option.id}`)) ?? 0;
      return {
        optionId: option.id,
        count: Math.max(0, rawCount),
      };
    });

    const totalRequestedVotes = countsByOption.reduce(
      (sum, option) => sum + option.count,
      0,
    );

    if (totalRequestedVotes < 1) {
      return { error: "Enter at least one vote across the poll options." };
    }

    const users = await listAllAuthUsers();
    const mockUsers = users.filter((user) => user.user_metadata?.is_mock === true);

    const { data: existingVotes, error: existingVotesError } = await supabase
      .from("votes")
      .select("user_id")
      .eq("poll_id", pollId);

    if (existingVotesError) {
      return { error: existingVotesError.message };
    }

    const existingUserIds = new Set(
      (existingVotes ?? []).map((vote) => vote.user_id as string),
    );

    const eligibleUsers = shuffleDataset(
      mockUsers.filter((user) => !existingUserIds.has(user.id)),
    );

    if (eligibleUsers.length < totalRequestedVotes) {
      return {
        error: `Not enough eligible mock users. Requested ${totalRequestedVotes}, but only ${eligibleUsers.length} mock users can still vote on this poll.`,
      };
    }

    const campaignId = `mock-votes-${formatBatchTimestamp(new Date())}`;
    const voteAssignments: Array<{
      poll_id: string;
      user_id: string;
      option_id: string;
      created_at: string;
      updated_at: string;
      is_mock: boolean;
      mock_campaign_id: string;
      seed_source: string;
    }> = [];

    let userIndex = 0;

    for (const option of countsByOption) {
      for (let index = 0; index < option.count; index += 1) {
        const assignedUser = eligibleUsers[userIndex];
        userIndex += 1;
        const voteTimestamp = randomTimestampBetween(startAt, endAt);

        voteAssignments.push({
          poll_id: pollId,
          user_id: assignedUser.id,
          option_id: option.optionId,
          created_at: voteTimestamp,
          updated_at: voteTimestamp,
          is_mock: true,
          mock_campaign_id: campaignId,
          seed_source: "admin-vote-campaign",
        });
      }
    }

    voteAssignments.sort((a, b) => a.created_at.localeCompare(b.created_at));

    const { error: insertError } = await supabase
      .from("votes")
      .insert(voteAssignments);

    if (insertError) {
      return { error: insertError.message };
    }

    await recalculateOptionVoteCounts(supabase, [pollId]);

    revalidatePath("/admin");
    revalidatePath("/admin/management");
    revalidatePath("/admin/vote-campaigns");

    return {
      success: "Vote campaign created successfully.",
      campaignId,
      createdCount: voteAssignments.length,
      pollTitle: poll.title,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to create vote campaign.",
    };
  }
}

export async function deleteVoteCampaign(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin();
    const campaignId = normalizeText(formData.get("campaignId"));

    if (!campaignId) {
      return { error: "Vote campaign id is required." };
    }

    const { data: campaignVotes, error: fetchError } = await supabase
      .from("votes")
      .select("id, poll_id")
      .eq("mock_campaign_id", campaignId)
      .eq("is_mock", true);

    if (fetchError) {
      return { error: fetchError.message };
    }

    if (!campaignVotes?.length) {
      return { error: "No mock votes were found for that campaign." };
    }

    const affectedPollIds = [
      ...new Set(campaignVotes.map((vote) => vote.poll_id as string)),
    ];

    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .eq("mock_campaign_id", campaignId)
      .eq("is_mock", true);

    if (deleteError) {
      return { error: deleteError.message };
    }

    await recalculateOptionVoteCounts(supabase, affectedPollIds);

    revalidatePath("/admin");
    revalidatePath("/admin/management");
    revalidatePath("/admin/vote-campaigns");

    return { success: "Vote campaign deleted." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to delete vote campaign.",
    };
  }
}

export async function updatePollStatus(
  pollId: string,
  status: "live" | "closed" | "draft",
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("polls")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", pollId);

    if (error) return { error: error.message };

    revalidatePath(`/admin/polls/${pollId}`);
    revalidatePath("/admin/management");
    revalidatePath("/admin");
    return { success: `Poll set to ${status}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update status." };
  }
}

export async function togglePollFeatured(
  pollId: string,
  nextValue: boolean,
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("polls")
      .update({ is_featured: nextValue, updated_at: new Date().toISOString() })
      .eq("id", pollId);

    if (error) return { error: error.message };

    revalidatePath(`/admin/polls/${pollId}`);
    revalidatePath("/admin/management");
    revalidatePath("/admin");
    return { success: nextValue ? "Poll featured." : "Poll unfeatured." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to toggle featured." };
  }
}

export async function togglePollPinned(
  pollId: string,
  nextValue: boolean,
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("polls")
      .update({ is_pinned: nextValue, updated_at: new Date().toISOString() })
      .eq("id", pollId);

    if (error) return { error: error.message };

    revalidatePath(`/admin/polls/${pollId}`);
    revalidatePath("/admin/management");
    revalidatePath("/admin");
    return { success: nextValue ? "Poll pinned." : "Poll unpinned." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to toggle pinned." };
  }
}
