import useAuthStore from "@/store/auth_store";
import api from "./api";

export const handleResult = async (uri: string) => {
  const user = useAuthStore.getState().user;

  const filename = uri.split("/").pop() ?? `photo_${Date.now()}.jpg`;
  const ext = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase() ?? "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";

  const formData = new FormData();
  // React Native's axios accepts this same special shape to represent a file.
  formData.append("file", {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  if (user?.avatar_url) {
    const filename = user.avatar_url.split("/").pop() ?? "";
    formData.append("old_avatar_url", filename);
  }

  const response = await api.post<{ url: string }>(
    "/profile/upload",
    formData,

    {
      headers: {
        // RN's networking layer fills in the multipart boundary itself —
        // this just tells it (and overrides any 'application/json' default
        // your axios instance might set) that this request is multipart.
        "Content-Type": "multipart/form-data",
      },
    },
  );
  useAuthStore
    .getState()
    .updateAvatar(`${process.env.EXPO_PUBLIC_API_URL}${response.data.url}`);
  // console.log(`${process.env.EXPO_PUBLIC_API_URL}${response.data.url}`);
};
