import { supabase } from "./supabase";

export interface PartnerRequest {
  name_business: string;
  responsible_name: string;
  whatsapp: string;
  instagram?: string;
  city: string;
  event_type: string;
  message?: string;
}

export async function submitPartnerRequest(data: PartnerRequest) {
  const { error } = await supabase
    .from("partner_requests")
    .insert([
      {
        name_business: data.name_business,
        responsible_name: data.responsible_name,
        whatsapp: data.whatsapp,
        instagram: data.instagram || null,
        city: data.city,
        event_type: data.event_type,
        message: data.message || null,
        status: "pending",
      },
    ]);

  if (error) {
    console.error("Erro ao enviar solicitação de parceiro:", error);
    throw error;
  }

  return true;
}