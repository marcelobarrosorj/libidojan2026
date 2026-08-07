import { supabase } from './supabase';
import { Report, AdminLog } from '../types';

export const getReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase.from('reports').select('*');
  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
  return data.map((row: any) => ({
    id: String(row.id),
    reporterId: row.reporter_id,
    targetUserId: row.target_id || row.target_user_id,
    reason: row.reason,
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    status: row.status
  }));
};

export const getAdminLogs = async (): Promise<AdminLog[]> => {
  const { data, error } = await supabase.from('admin_logs').select('*');
  if (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
  return data.map((row: any) => ({
    id: String(row.id),
    adminId: row.admin_id,
    action: row.action,
    targetId: row.target_id,
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  }));
};

export const createAdminLog = async (log: Omit<AdminLog, 'id' | 'timestamp'>) => {
  const { error } = await supabase.from('admin_logs').insert({
    admin_id: log.adminId,
    action: log.action,
    target_id: log.targetId
  });
  if (error) {
    console.error('Error creating admin log:', error);
  }
};

export const createReport = async (report: Omit<Report, 'id' | 'timestamp' | 'status'>) => {
  const { error } = await supabase.from('reports').insert({
    reporter_id: report.reporterId,
    target_id: report.targetUserId,
    target_user_id: report.targetUserId,
    reason: report.reason,
    status: 'pending'
  });
  if (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};
