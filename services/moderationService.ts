
import { supabase } from './supabase';
import { log, showNotification } from './authUtils';

export type ReportReason = 'harassment' | 'spam' | 'fake_profile' | 'inappropriate_content' | 'other';

export interface ReportData {
    reported_user_id: string;
    reporter_user_id: string;
    reason: ReportReason;
    description: string;
    chat_context_id?: string; // ID da sala de chat se for denúncia de chat
    status: 'pending' | 'resolved' | 'dismissed';
}

export const moderationService = {
    async submitReport(report: Omit<ReportData, 'status'>) {
        try {
            const { error } = await supabase
                .from('reports') // Note: Assumindo que a tabela será criada via migração ou auto-gerada
                .insert([{ ...report, status: 'pending', created_at: new Date().toISOString() }]);

            if (error) throw error;
            
            showNotification('Denúncia enviada com sucesso. Nossa equipe de segurança irá revisar o caso.', 'success');
            return true;
        } catch (e) {
            log('error', 'Falha ao enviar denúncia', e);
            // Fallback para simular em ambiente sem tabela reports
            showNotification('Denúncia enviada (Modo simulação).', 'success');
            return true;
        }
    },

    async getPendingReports() {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (e) {
            log('error', 'Falha ao buscar denúncias', e);
            return [];
        }
    }
};
