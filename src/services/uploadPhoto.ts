import { supabase } from "./supabase";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout após ${ms}ms`)), ms)
    )
  ]);
}

export async function uploadPhoto(file: File, requestedUserId: string) {
  const sessionData = await supabase.auth.getSession();
  const authUserId = sessionData.data.session?.user?.id;
  
  if (!authUserId) {
    throw new Error("Usuário não autenticado.");
  }
  
  if (requestedUserId && authUserId !== requestedUserId) {
    throw new Error("Não autorizado.");
  }
  
  const userId = authUserId;

  console.log("🔥 INICIANDO UPLOAD NO STORAGE PARA O USER: ", userId);
  
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${Date.now()}-${safeFilename}`;

  if (!supabase || !supabase.storage) {
    throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
  }

  const uploadPromise = supabase.storage
    .from("photos")
    .upload(filePath, file, {
        upsert: false
    });

  const { error, data: uploadData } = await withTimeout(
    uploadPromise, 
    6000, 
    "Supabase Storage Upload"
  );

  if (error) {
    console.error("❌ UPLOAD ERROR NO SUPABASE STORAGE:", error.message, error.name);
    throw new Error(`STORAGE_UPLOAD_ERROR: ${error.message} - ${error.name}`);
  }

  const { data } = supabase.storage
    .from("photos")
    .getPublicUrl(filePath);
      
  if (!data || !data.publicUrl) {
    throw new Error("FAILED_TO_GET_PUBLIC_URL_FROM_STORAGE");
  }

  return data.publicUrl;
}
