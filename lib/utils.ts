export const AVATAR_COLORS = [
  "bg-blue-600 text-white",
  "bg-emerald-600 text-white",
  "bg-violet-600 text-white",
  "bg-amber-600 text-white",
  "bg-rose-600 text-white",
  "bg-indigo-600 text-white",
];

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function getInitials(name: string | null | undefined, email: string | undefined): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email && email.length > 0) {
    return email.substring(0, 2).toUpperCase();
  }
  return "U";
}
