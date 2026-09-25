import type { RequestHandler } from '@sveltejs/kit';
import ExcelJS from 'exceljs';
import { query } from '$lib/server/db';
import { hasPermission } from '$lib/rbac';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || !hasPermission(locals.user.role, 'result:export')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Optimasi: 1 query dengan LEFT JOIN (jauh lebih cepat dari subquery)
  const rows = await query<any>(
    `SELECT
       u.full_name,
       c.position_applied,
       c.nik,
       c.education,
       c.status,
       MAX(CASE WHEN tc.code = 'INTEL' THEN ts.percentage END) AS intel_pct,
       MAX(CASE WHEN tc.code = 'PERSONALITY' THEN ts.percentage END) AS personality_pct,
       MAX(pr.integrity_score) AS integrity_score,
       MAX(pr.conflict_mgmt_score) AS conflict_mgmt_score,
       MAX(pr.conviction_score) AS conviction_score,
       MAX(pr.creativity_score) AS creativity_score,
       MAX(pr.teamwork_score) AS teamwork_score,
       MAX(pr.interpersonal_score) AS interpersonal_score
     FROM candidates c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN test_sessions ts ON ts.candidate_id = c.id AND ts.status = 'completed'
     LEFT JOIN test_categories tc ON tc.id = ts.category_id
     LEFT JOIN personality_results pr ON pr.candidate_id = c.id
     GROUP BY c.id, u.full_name, c.position_applied, c.nik, c.education, c.status
     ORDER BY u.full_name`
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Psychotest Enterprise';
  wb.created = new Date();

  const ws = wb.addWorksheet('Hasil Psikotes');
  ws.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Nama', key: 'name', width: 28 },
    { header: 'NIK', key: 'nik', width: 18 },
    { header: 'Pendidikan', key: 'edu', width: 22 },
    { header: 'Posisi', key: 'position', width: 24 },
    { header: 'Intellegensi (%)', key: 'intel', width: 16 },
    { header: 'Kepribadian (%)', key: 'pers', width: 16 },
    { header: 'Integritas', key: 'integ', width: 12 },
    { header: 'Manajemen Konflik', key: 'conflict', width: 18 },
    { header: 'Pendirian', key: 'conv', width: 12 },
    { header: 'Kreativitas', key: 'crea', width: 12 },
    { header: 'Teamwork', key: 'team', width: 12 },
    { header: 'Interpersonal', key: 'inter', width: 14 },
    { header: 'Status', key: 'status', width: 14 }
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
  ws.getRow(1).height = 22;

  rows.forEach((r: any, i: number) => {
    ws.addRow({
      no: i + 1,
      name: r.full_name,
      nik: r.nik ?? '-',
      edu: r.education ?? '-',
      position: r.position_applied ?? '-',
      intel: r.intel_pct !== null ? Number(r.intel_pct).toFixed(2) : '-',
      pers: r.personality_pct !== null ? Number(r.personality_pct).toFixed(2) : '-',
      integ: r.integrity_score ?? 0,
      conflict: r.conflict_mgmt_score ?? 0,
      conv: r.conviction_score ?? 0,
      crea: r.creativity_score ?? 0,
      team: r.teamwork_score ?? 0,
      inter: r.interpersonal_score ?? 0,
      status: r.status
    });
  });

  const buffer = await wb.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="psikotest-report-${Date.now()}.xlsx"`
    }
  });
};
