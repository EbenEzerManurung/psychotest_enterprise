// File ini boleh diimport di client & server (bukan folder server/)

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  USER_CRUD: 'user:crud',
  CANDIDATE_CRUD: 'candidate:crud',
  QUESTION_CRUD: 'question:crud',
  RESULT_VIEW: 'result:view',
  RESULT_EXPORT: 'result:export',
  TEST_ASSIGN: 'test:assign',
  TEST_TAKE: 'test:take'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: Object.values(PERMISSIONS),
  hr: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CANDIDATE_CRUD,
    PERMISSIONS.QUESTION_CRUD,
    PERMISSIONS.RESULT_VIEW,
    PERMISSIONS.RESULT_EXPORT,
    PERMISSIONS.TEST_ASSIGN
  ],
  candidate: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.TEST_TAKE]
};

export function hasPermission(role: string, permission: string): boolean {
  return (ROLE_PERMISSIONS[role] || []).includes(permission as Permission);
}

export function getPermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

export const MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home', permission: PERMISSIONS.DASHBOARD_VIEW },
  { href: '/users', label: 'Manage User', icon: 'users', permission: PERMISSIONS.USER_CRUD },
  { href: '/candidates', label: 'Calon Karyawan', icon: 'briefcase', permission: PERMISSIONS.CANDIDATE_CRUD },
  { href: '/questions/intelligence', label: 'Soal Intellegensi', icon: 'brain', permission: PERMISSIONS.QUESTION_CRUD },
  { href: '/questions/personality', label: 'Soal Kepribadian', icon: 'heart', permission: PERMISSIONS.QUESTION_CRUD },
  { href: '/results', label: 'Hasil Test', icon: 'chart', permission: PERMISSIONS.RESULT_VIEW },
  { href: '/reports', label: 'Laporan & Export', icon: 'report', permission: PERMISSIONS.RESULT_EXPORT },
  { href: '/test', label: 'Ikuti Tes', icon: 'edit', permission: PERMISSIONS.TEST_TAKE }
];
