'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedTo: string | null;
  projectRef: string | null;
  dueDate: string | null;
  origin: string;
  originalText: string | null;
  docId: string | null;
  blockedByTaskId: string | null;
  blockedReason: string | null;
  createdAt: string;
  meeting?: { meetingDate: string; docTitle: string | null } | null;
}

interface Candidate {
  id: string;
  originalText: string;
  suggestedTitle: string | null;
  aiType: string;
  aiAssignee: string | null;
  aiProjectRef: string | null;
  aiNotes: string | null;
  meetingDate: string | null;
  docTitle: string | null;
  docId: string | null;
  status: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; cls: string }> = {
  TODO: { label: 'Pendiente', dot: 'bg-gray-400', cls: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'En curso', dot: 'bg-blue-500', cls: 'bg-blue-50 text-blue-700' },
  BLOCKED: { label: 'Bloqueada', dot: 'bg-red-500', cls: 'bg-red-50 text-red-700' },
  DONE: { label: 'Finalizada', dot: 'bg-green-500', cls: 'bg-green-50 text-green-700' },
};

const GOOGLE_DOC_ID = '1m_YpLiUMy15Qn3qR-LmFU66EL3_YWQ2dFTtDR5LqzKU';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.TODO;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function QuickStatusButton({ task, onUpdate }: { task: Task; onUpdate: () => void }) {
  const next: Record<TaskStatus, TaskStatus> = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    BLOCKED: 'TODO',
    DONE: 'TODO',
  };
  const labels: Record<TaskStatus, string> = {
    TODO: 'Iniciar',
    IN_PROGRESS: 'Completar',
    BLOCKED: 'Desbloquear',
    DONE: 'Reabrir',
  };
  async function handleClick() {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next[task.status] }),
    });
    onUpdate();
  }
  if (task.status === 'DONE') return null;
  return (
    <button
      onClick={handleClick}
      className="text-xs font-medium text-blue-600 hover:text-blue-800 transition">
      {labels[task.status]}
    </button>
  );
}

function TaskCard({
  task,
  onUpdate,
  allTasks,
}: {
  task: Task;
  onUpdate: () => void;
  allTasks: Task[];
}) {
  const [expanded, setExpanded] = useState(false);
  const blockerTask = task.blockedByTaskId
    ? allTasks.find((t) => t.id === task.blockedByTaskId)
    : null;

  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
        task.status === 'DONE' ? 'opacity-60' : ''
      } ${task.status === 'BLOCKED' ? 'border-red-200' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-start gap-3">
        {/* Done checkbox */}
        <button
          onClick={async () => {
            await fetch(`/api/tasks/${task.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: task.status === 'DONE' ? 'TODO' : 'DONE' }),
            });
            onUpdate();
          }}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
            task.status === 'DONE'
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-400'
          }`}>
          {task.status === 'DONE' && (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium text-gray-900 leading-snug ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </p>
            <StatusBadge status={task.status} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {task.assignedTo && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                {task.assignedTo}
              </span>
            )}
            {task.projectRef && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {task.projectRef}
              </span>
            )}
            {task.meeting && (
              <span className="text-xs text-gray-400">
                Reunión{' '}
                {new Date(task.meeting.meetingDate + 'T00:00:00').toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
            {task.dueDate && (
              <span
                className={`text-xs font-medium ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-600' : 'text-gray-500'}`}>
                Vence{' '}
                {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
            {task.origin === 'IMPORTED' && (
              <span className="text-2xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                importada
              </span>
            )}
          </div>

          {/* Blocked by */}
          {task.status === 'BLOCKED' && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
              {blockerTask
                ? `Bloqueada por: ${blockerTask.title}`
                : (task.blockedReason ?? 'Bloqueada')}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            <QuickStatusButton task={task} onUpdate={onUpdate} />
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-400 hover:text-gray-700 transition">
              {expanded ? 'Cerrar' : 'Detalle'}
            </button>
            {task.docId && (
              <a
                href={`https://docs.google.com/document/d/${task.docId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-blue-600 transition flex items-center gap-1">
                Ver en Doc
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
          </div>

          {/* Expanded detail */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              {task.description && <p className="text-xs text-gray-600">{task.description}</p>}
              {task.originalText && task.originalText !== task.title && (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-2xs text-gray-400 mb-1 uppercase tracking-wide">
                    Texto original
                  </p>
                  <p className="text-xs text-gray-600 italic">"{task.originalText}"</p>
                </div>
              )}
              <TaskStatusSelector task={task} onUpdate={onUpdate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskStatusSelector({ task, onUpdate }: { task: Task; onUpdate: () => void }) {
  async function change(status: TaskStatus) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onUpdate();
  }
  return (
    <div className="flex gap-1.5 flex-wrap">
      {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
        <button
          key={s}
          onClick={() => change(s)}
          className={`text-xs px-2.5 py-1 rounded-lg transition font-medium ${
            task.status === s
              ? `${STATUS_CONFIG[s].cls} ring-1 ring-current`
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}>
          {STATUS_CONFIG[s].label}
        </button>
      ))}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function MisTablas({ tasks, onUpdate }: { tasks: Task[]; onUpdate: () => void }) {
  const { data: session } = useSession();
  const email = session?.user?.email ?? '';
  const name = session?.user?.name ?? '';
  const mine = tasks.filter(
    (t) => (t.assignedTo && (t.assignedTo === email || t.assignedTo === name)) || !t.assignedTo,
  );

  const order: TaskStatus[] = ['BLOCKED', 'IN_PROGRESS', 'TODO', 'DONE'];
  const grouped = order.reduce(
    (acc, s) => {
      acc[s] = mine.filter((t) => t.status === s);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  const active = mine.filter((t) => t.status !== 'DONE');

  if (active.length === 0 && mine.length === 0) {
    return (
      <div className="text-center py-20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-12 h-12 text-gray-300 mx-auto mb-4">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <p className="text-gray-500 text-sm font-medium">No tenés tareas asignadas</p>
        <p className="text-gray-400 text-xs mt-1">
          Cuando se detecten tareas tuyas desde el Google Doc, aparecerán acá.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {order.map((status) => {
        const group = grouped[status];
        if (group.length === 0) return null;
        return (
          <div key={status}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
              {STATUS_CONFIG[status].label} ({group.length})
            </h3>
            <div className="space-y-2">
              {group.map((t) => (
                <TaskCard key={t.id} task={t} onUpdate={onUpdate} allTasks={tasks} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Tablero({ tasks, onUpdate }: { tasks: Task[]; onUpdate: () => void }) {
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [search, setSearch] = useState('');
  const [showDone, setShowDone] = useState(false);

  const assignees = [...new Set(tasks.map((t) => t.assignedTo).filter(Boolean))] as string[];
  const projects = [...new Set(tasks.map((t) => t.projectRef).filter(Boolean))] as string[];

  const filtered = tasks.filter((t) => {
    if (!showDone && t.status === 'DONE') return false;
    if (filterAssignee && t.assignedTo !== filterAssignee) return false;
    if (filterProject && t.projectRef !== filterProject) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: { status: TaskStatus; label: string }[] = [
    { status: 'TODO', label: 'Pendiente' },
    { status: 'IN_PROGRESS', label: 'En curso' },
    { status: 'BLOCKED', label: 'Bloqueada' },
    { status: 'DONE', label: 'Finalizada' },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarea…"
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 min-w-48"
          />
        </div>
        {assignees.length > 0 && (
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
            <option value="">Todos los responsables</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}
        {projects.length > 0 && (
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
            <option value="">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
            className="rounded"
          />
          Ver finalizadas
        </label>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(({ status, label }) => {
          const col = filtered.filter((t) => t.status === status);
          return (
            <div key={status}>
              <div className={`flex items-center gap-2 mb-3 px-1`}>
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[status].dot}`} />
                <span className="text-xs font-semibold text-gray-700">{label}</span>
                <span className="text-xs text-gray-400 ml-auto">{col.length}</span>
              </div>
              <div className="space-y-2 min-h-20">
                {col.map((t) => (
                  <TaskCard key={t.id} task={t} onUpdate={onUpdate} allTasks={tasks} />
                ))}
                {col.length === 0 && (
                  <div className="border-2 border-dashed border-gray-100 rounded-xl p-4 text-center text-xs text-gray-300">
                    Sin tareas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Detectadas({ pending, onRefresh }: { pending: Candidate[]; onRefresh: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [syncError, setSyncError] = useState('');
  const [docId, setDocId] = useState(GOOGLE_DOC_ID);
  const [editing, setEditing] = useState<
    Record<string, { title: string; assignedTo: string; projectRef: string }>
  >({});

  async function sync() {
    setSyncing(true);
    setSyncMsg('');
    setSyncError('');
    const res = await fetch('/api/sync/gdoc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId }),
    });
    const data = await res.json();
    setSyncing(false);
    if (res.ok) {
      setSyncMsg(
        `✓ ${data.newCandidates} tarea${data.newCandidates !== 1 ? 's' : ''} nueva${data.newCandidates !== 1 ? 's' : ''} detectada${data.newCandidates !== 1 ? 's' : ''} de "${data.docTitle}"`,
      );
      onRefresh();
    } else {
      setSyncError(data.error ?? 'Error al sincronizar');
    }
  }

  async function act(id: string, action: 'confirm' | 'discard', candidate: Candidate) {
    const edit = editing[id];
    await fetch(`/api/import-candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        title: edit?.title || candidate.suggestedTitle || candidate.originalText,
        assignedTo: edit?.assignedTo || candidate.aiAssignee || '',
        projectRef: edit?.projectRef || candidate.aiProjectRef || '',
      }),
    });
    onRefresh();
  }

  function startEdit(c: Candidate) {
    setEditing((prev) => ({
      ...prev,
      [c.id]: {
        title: c.suggestedTitle ?? c.originalText,
        assignedTo: c.aiAssignee ?? '',
        projectRef: c.aiProjectRef ?? '',
      },
    }));
  }

  const grouped = pending.reduce(
    (acc, c) => {
      const key = c.meetingDate ?? 'sin-fecha';
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    },
    {} as Record<string, Candidate[]>,
  );

  return (
    <div>
      {/* Sync panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Sincronizar Google Doc</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Detecta tareas y decisiones nuevas del documento de reuniones
            </p>
          </div>
          <button
            onClick={sync}
            disabled={syncing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {syncing ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sincronizando…
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Sincronizar ahora
              </>
            )}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="ID del documento de Google"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-xs"
          />
          <a
            href={`https://docs.google.com/document/d/${docId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition">
            Abrir
          </a>
        </div>
        {syncMsg && (
          <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {syncMsg}
          </p>
        )}
        {syncError && (
          <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {syncError}
          </p>
        )}
      </div>

      {/* Pending candidates */}
      {pending.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-10 h-10 text-gray-300 mx-auto mb-3">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 text-sm font-medium">Sin tareas pendientes de revisión</p>
          <p className="text-gray-400 text-xs mt-1">
            Sincronizá el Google Doc para detectar nuevas tareas
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, candidates]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Reunión{' '}
                    {date !== 'sin-fecha'
                      ? new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'sin fecha detectada'}
                  </h3>
                  <span className="text-xs text-gray-400">{candidates[0]?.docTitle}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                    {candidates.length} por revisar
                  </span>
                </div>

                <div className="space-y-3">
                  {candidates.map((c) => {
                    const edit = editing[c.id];
                    const isEditing = !!edit;
                    return (
                      <div
                        key={c.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {c.aiType === 'DECISION' ? (
                              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                D
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                T
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  value={edit.title}
                                  onChange={(e) =>
                                    setEditing((p) => ({
                                      ...p,
                                      [c.id]: { ...p[c.id], title: e.target.value },
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                />
                                <div className="flex gap-2">
                                  <input
                                    value={edit.assignedTo}
                                    onChange={(e) =>
                                      setEditing((p) => ({
                                        ...p,
                                        [c.id]: { ...p[c.id], assignedTo: e.target.value },
                                      }))
                                    }
                                    placeholder="Responsable"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                  />
                                  <input
                                    value={edit.projectRef}
                                    onChange={(e) =>
                                      setEditing((p) => ({
                                        ...p,
                                        [c.id]: { ...p[c.id], projectRef: e.target.value },
                                      }))
                                    }
                                    placeholder="Proyecto"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {c.suggestedTitle ?? c.originalText}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {c.aiAssignee && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <svg
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-3 h-3">
                                        <path
                                          fillRule="evenodd"
                                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {c.aiAssignee}
                                    </span>
                                  )}
                                  {c.aiProjectRef && (
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                      {c.aiProjectRef}
                                    </span>
                                  )}
                                  {c.aiNotes && (
                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                      ⚠ {c.aiNotes}
                                    </span>
                                  )}
                                </div>
                                {/* Original text */}
                                <p className="text-xs text-gray-400 mt-1.5 italic">
                                  "{c.originalText}"
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => act(c.id, 'confirm', c)}
                                className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                                <svg
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-3.5 h-3.5">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Confirmar
                              </button>
                              <button
                                onClick={() =>
                                  isEditing
                                    ? setEditing((p) => {
                                        const n = { ...p };
                                        delete n[c.id];
                                        return n;
                                      })
                                    : startEdit(c)
                                }
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg transition">
                                {isEditing ? 'Cancelar' : 'Editar'}
                              </button>
                              <button
                                onClick={() => act(c.id, 'discard', c)}
                                className="text-xs text-gray-400 hover:text-red-600 transition px-2 py-1.5 rounded-lg hover:bg-red-50">
                                Descartar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── New task quick form ──────────────────────────────────────────────────────

function NewTaskForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [projectRef, setProjectRef] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, assignedTo, projectRef }),
    });
    setSaving(false);
    setTitle('');
    setAssignedTo('');
    setProjectRef('');
    setOpen(false);
    onSaved();
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Nueva tarea
      </button>
    );
  }

  return (
    <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm mb-6">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="¿Qué hay que hacer?"
        className="w-full text-sm font-medium placeholder:text-gray-400 focus:outline-none mb-3"
      />
      <div className="flex gap-2 mb-3">
        <input
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Responsable"
          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
        <input
          value={projectRef}
          onChange={(e) => setProjectRef(e.target.value)}
          placeholder="Proyecto"
          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !title.trim()}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {saving ? 'Guardando…' : 'Crear tarea'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-gray-400 hover:text-gray-700 transition px-2">
          Cancelar
        </button>
        <span className="text-xs text-gray-300 self-center ml-1">
          ↵ Enter para guardar · Esc para cancelar
        </span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type TabId = 'mis-tareas' | 'tablero' | 'detectadas';

export default function TareasPage() {
  const [tab, setTab] = useState<TabId>('mis-tareas');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [tasksRes, candidatesRes] = await Promise.all([
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/import-candidates?status=PENDING').then((r) => r.json()),
    ]);
    setTasks(Array.isArray(tasksRes) ? tasksRes : []);
    setCandidates(Array.isArray(candidatesRes) ? candidatesRes : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const pendingCount = candidates.length;
  const activeTasks = tasks.filter((t) => t.status !== 'DONE').length;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'mis-tareas', label: 'Mis tareas' },
    { id: 'tablero', label: 'Tablero del equipo', count: activeTasks },
    { id: 'detectadas', label: 'Tareas detectadas', count: pendingCount },
  ];

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Gestión</p>
          <h1 className="text-2xl font-semibold text-gray-900">Tareas</h1>
        </div>
        {tab !== 'detectadas' && <NewTaskForm onSaved={load} />}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}>
            {t.label}
            {t.count != null && t.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Cargando…</div>
      ) : (
        <>
          {tab === 'mis-tareas' && <MisTablas tasks={tasks} onUpdate={load} />}
          {tab === 'tablero' && <Tablero tasks={tasks} onUpdate={load} />}
          {tab === 'detectadas' && <Detectadas pending={candidates} onRefresh={load} />}
        </>
      )}
    </div>
  );
}
